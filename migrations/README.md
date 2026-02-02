# Database Migrations

This directory contains database migration scripts for the Insertabot production database.

## 🚨 Current Status: MIGRATION READY

**Production database is missing critical schema columns required by deployed Worker code.**

### Critical Issues Identified

1. **Missing email verification fields** - `email_verified`, `email_verification_token`, etc.
2. **Missing authentication fields** - `failed_login_attempts`, `account_locked_until`
3. **Potentially missing tables** - `sessions`, `security_logs`, `knowledge_base`

### Impact

- ✅ App is currently working (most features)
- ⚠️ Email verification endpoints will fail
- ⚠️ Account lockout features won't work
- ⚠️ Some security features non-functional

### Risk Level: MEDIUM

- 9 active production customers
- Schema changes are additive only (no data loss risk)
- Existing customers will be grandfathered (email_verified = 1)

## Quick Start

### Option 1: Automated Migration (Recommended)

```bash
cd /home/m1styk/Projects/insertabot-v1.0/migrations

# Step 1: Backup
./backup-production.sh

# Step 2: Migrate
./migrate-production.sh

# Step 3: Validate
wrangler d1 execute insertabot-production --file=validate-schema.sql
```

### Option 2: Manual Migration

```bash
# Step 1: Backup
wrangler d1 export insertabot-production --output=./backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Step 2: Run migrations individually
wrangler d1 execute insertabot-production --file=001-add-email-verification-fields.sql
wrangler d1 execute insertabot-production --file=002-add-missing-auth-fields.sql
wrangler d1 execute insertabot-production --file=003-verify-tables-exist.sql

# Step 3: Validate
wrangler d1 execute insertabot-production --file=validate-schema.sql
```

## Files in This Directory

### Migration Scripts

| File | Purpose | Safe to Rerun? |
|------|---------|----------------|
| `001-add-email-verification-fields.sql` | Adds email verification columns | ⚠️ No (will error if columns exist) |
| `002-add-missing-auth-fields.sql` | Adds auth columns | ⚠️ Partial (some may fail) |
| `003-verify-tables-exist.sql` | Creates missing tables | ✅ Yes (uses IF NOT EXISTS) |
| `production-schema-migration.sql` | All-in-one migration script | ⚠️ No (use individual files) |

### Automation Scripts

| File | Purpose |
|------|---------|
| `backup-production.sh` | Creates and verifies backup |
| `migrate-production.sh` | Orchestrates migration with safety checks |

### Validation & Rollback

| File | Purpose |
|------|---------|
| `validate-schema.sql` | Post-migration validation queries |
| `rollback-procedures.md` | Emergency rollback guide |

### Documentation

| File | Purpose |
|------|---------|
| `MIGRATION-GUIDE.md` | Comprehensive migration guide |
| `README.md` | This file - quick reference |

## Pre-Migration Checklist

Before running migration:

- [ ] Read [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
- [ ] Have `wrangler` CLI installed and authenticated
- [ ] Confirmed access to production database
- [ ] Reviewed migration scripts
- [ ] Prepared rollback plan
- [ ] Notified team (if applicable)
- [ ] Scheduled maintenance window (optional - low risk)

## Migration Safety Features

✅ **Backup Required** - Scripts check for backup before proceeding
✅ **Confirmation Prompts** - Double confirmation before making changes
✅ **Additive Only** - No DROP or DELETE operations
✅ **Idempotent** - Uses IF NOT EXISTS where possible
✅ **Validation Included** - Comprehensive post-migration checks
✅ **Rollback Ready** - Documented rollback procedures

## What Gets Changed

### customers Table

**New columns added:**
- `email_verified` (INTEGER, default 0) - Existing customers set to 1
- `email_verification_token` (TEXT)
- `email_verification_expires` (INTEGER)
- `email_verification_sent_at` (INTEGER)
- `failed_login_attempts` (INTEGER, default 0)
- `account_locked_until` (INTEGER)

**New indexes:**
- `idx_customers_verification_token`
- `idx_customers_reset_token`

### New Tables (if missing)

- `sessions` - User session management
- `security_logs` - Security audit trail
- `knowledge_base` - RAG/AI knowledge entries

### What Doesn't Change

✅ All existing customer data
✅ All API keys
✅ All widget configurations
✅ All conversations and messages
✅ All passwords and authentication data

## Post-Migration Verification

After migration, verify:

```bash
# 1. Customer count unchanged (should be 9)
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) FROM customers;"

# 2. All customers email_verified = 1
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) FROM customers WHERE email_verified = 1;"

# 3. Required columns exist
wrangler d1 execute insertabot-production --command="SELECT email_verified, email_verification_token FROM customers LIMIT 1;"

# 4. Run full validation
wrangler d1 execute insertabot-production --file=validate-schema.sql
```

## Testing After Migration

Test these endpoints:

```bash
# 1. Authentication (existing customer)
curl -X POST https://insertabot.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Widget config (existing API key)
curl https://insertabot.io/api/config/widget \
  -H "Authorization: Bearer ib_sk_..."

# 3. Email verification (new feature)
curl -X POST https://insertabot.io/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Rollback Instructions

If migration fails or causes issues:

```bash
# Quick rollback (restore from backup)
wrangler d1 execute insertabot-production --file=./backups/[BACKUP_FILE].sql
```

See [rollback-procedures.md](./rollback-procedures.md) for detailed instructions.

## Troubleshooting

### "duplicate column name" Error

**Expected** for migration 002 if some columns already exist. The `migrate-production.sh` script handles this automatically.

### "no such table: customers" Error

**STOP** - You may be connected to wrong database or database is corrupted. Verify database ID matches production.

### Migration Hangs

Check Cloudflare D1 dashboard for status. D1 has execution time limits. Try running individual migration files instead of the orchestration script.

## Timeline

- **Backup:** ~2-5 minutes
- **Migration:** ~1-3 minutes
- **Validation:** ~1 minute
- **Testing:** ~5-10 minutes
- **Total:** ~15-20 minutes

## Database Information

- **Database Name:** insertabot-production
- **Database ID:** 3d7d004d-ed6c-486c-a51e-a59f51bcd307
- **Current Customers:** 9 active
- **Current Size:** 208.9 KB
- **Worker:** insertabot-api

## Support & Documentation

- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Complete migration guide
- [rollback-procedures.md](./rollback-procedures.md) - Emergency procedures
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Project Schema](../schema.sql) - Target schema definition

## Migration History

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2026-01-20 | Add avatar to configs | ✅ Complete | Added default avatar URLs |
| 2026-01-31 | Development schema update | ✅ Complete | Applied to dev database |
| 2026-02-02 | Production auth migration | 📋 Ready | Awaiting execution |

## Next Steps

1. Review [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
2. Run `./backup-production.sh`
3. Run `./migrate-production.sh`
4. Validate with `validate-schema.sql`
5. Test endpoints
6. Monitor for 24-48 hours

---

**Questions?** See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) troubleshooting section or contact team.
