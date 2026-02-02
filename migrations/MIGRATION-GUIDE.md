# Production Database Migration Guide

**Date:** February 2, 2026
**Database:** insertabot-production
**Database ID:** 3d7d004d-ed6c-486c-a51e-a59f51bcd307
**Impact:** 9 active customers

## Executive Summary

The production database schema is missing critical columns required by the current Worker code, specifically for email verification and authentication features. This migration adds those missing columns safely while preserving all existing data.

### Critical Issues Addressed

1. **Missing email verification columns** - Required by `email-verification.ts`
   - `email_verified`, `email_verification_token`, `email_verification_expires`, `email_verification_sent_at`

2. **Missing authentication columns** - Required by `auth-endpoints.ts`
   - `failed_login_attempts`, `account_locked_until`

3. **Missing database tables** - Required by auth system
   - `sessions`, `security_logs`, `knowledge_base` (may not exist)

4. **Missing indexes** - For performance
   - `idx_customers_verification_token`, `idx_customers_reset_token`

## Migration Strategy

This migration uses a **safe, incremental approach**:

1. ✅ **Backup first** - Full database export before any changes
2. ✅ **Additive only** - Only adds columns/tables, never drops or modifies existing data
3. ✅ **Grandfather existing users** - Marks all existing customers as `email_verified = 1`
4. ✅ **Idempotent where possible** - Uses `IF NOT EXISTS` to allow reruns
5. ✅ **Validation included** - Comprehensive checks after migration

## Pre-Migration Checklist

- [ ] Review all migration scripts in this directory
- [ ] Verify you have `wrangler` CLI installed and authenticated
- [ ] Confirm you have access to production database
- [ ] Schedule migration during low-traffic period (if possible)
- [ ] Notify team of maintenance window
- [ ] Have rollback plan ready

## Migration Files

| File | Purpose |
|------|---------|
| `backup-production.sh` | Creates backup of production database |
| `001-add-email-verification-fields.sql` | Adds email verification columns |
| `002-add-missing-auth-fields.sql` | Adds authentication columns |
| `003-verify-tables-exist.sql` | Ensures required tables exist |
| `migrate-production.sh` | Main migration orchestration script |
| `validate-schema.sql` | Post-migration validation queries |
| `rollback-procedures.md` | Emergency rollback instructions |

## Step-by-Step Migration Procedure

### Step 1: Pre-Migration Verification

Check current database state:

```bash
# View current schema
wrangler d1 execute insertabot-production --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='customers';"

# Count customers
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) as customer_count FROM customers;"

# Check if email_verified column exists (should fail before migration)
wrangler d1 execute insertabot-production --command="SELECT email_verified FROM customers LIMIT 1;" 2>&1 | grep -q "no such column" && echo "✅ Column doesn't exist - migration needed"
```

### Step 2: Create Backup

**CRITICAL: Do not skip this step!**

```bash
cd /home/m1styk/Projects/insertabot-v1.0/migrations

# Make backup script executable
chmod +x backup-production.sh

# Run backup
./backup-production.sh
```

Expected output:
- Backup file created in `./backups/insertabot-production_YYYYMMDD_HHMMSS.sql`
- Compressed backup created with `.gz` extension
- Verification that key tables are present

**Verify backup:**
```bash
# Check backup file exists and is not empty
ls -lh ./backups/insertabot-production_*.sql

# Review backup contents (first 50 lines)
head -50 ./backups/insertabot-production_*.sql
```

### Step 3: Test Migration in Development (Optional but Recommended)

If you want to test first:

```bash
# Export production to local file
wrangler d1 export insertabot-production --output=./prod-export.sql

# Import to development database
wrangler d1 execute insertabot-development --file=./prod-export.sql

# Run migration on development
wrangler d1 execute insertabot-development --file=001-add-email-verification-fields.sql
wrangler d1 execute insertabot-development --file=002-add-missing-auth-fields.sql
wrangler d1 execute insertabot-development --file=003-verify-tables-exist.sql

# Validate
wrangler d1 execute insertabot-development --file=validate-schema.sql
```

### Step 4: Run Production Migration

```bash
# Make migration script executable
chmod +x migrate-production.sh

# Run migration (will prompt for confirmation)
./migrate-production.sh
```

The script will:
1. ✅ Check that backup exists
2. ✅ Prompt for confirmation twice
3. ✅ Execute migrations in order
4. ✅ Handle expected errors (duplicate columns)
5. ✅ Stop on unexpected errors

### Step 5: Validate Migration

```bash
# Run validation queries
wrangler d1 execute insertabot-production --file=validate-schema.sql
```

**Expected results:**
- Customer count: 9
- Email verified count: 9
- All required tables exist
- All required indexes exist
- No orphaned records

### Step 6: Test Functionality

Test these critical paths:

#### Test 1: Existing Customer Authentication
```bash
# Test login endpoint
curl -X POST https://insertabot.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Test 2: Widget Loading
```bash
# Test widget config endpoint (use actual API key)
curl https://insertabot.io/api/config/widget \
  -H "Authorization: Bearer ib_sk_..."
```

#### Test 3: Email Verification
```bash
# Test send verification email endpoint
curl -X POST https://insertabot.io/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Step 7: Monitor for Issues

Monitor for 24-48 hours:

```bash
# Check Worker logs
wrangler tail insertabot-api

# Look for database errors
wrangler tail insertabot-api | grep -i "database\|sql\|error"
```

## Expected Changes

### customers Table - New Columns

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `email_verified` | INTEGER | 0 | Track if email is verified |
| `email_verification_token` | TEXT | NULL | Token for email verification |
| `email_verification_expires` | INTEGER | NULL | Expiry timestamp for token |
| `email_verification_sent_at` | INTEGER | NULL | Rate limiting for emails |
| `failed_login_attempts` | INTEGER | 0 | Track failed login attempts |
| `account_locked_until` | INTEGER | NULL | Temporary account lock |

### New Indexes

- `idx_customers_verification_token` - Fast lookup of verification tokens
- `idx_customers_reset_token` - Fast lookup of password reset tokens

### New Tables (if missing)

- `sessions` - Session management for authenticated users
- `security_logs` - Audit trail of security events
- `knowledge_base` - RAG/AI context data

## Data Safety

### What Changes:
- ✅ Adds new columns to `customers` table
- ✅ Adds new tables if they don't exist
- ✅ Adds indexes for performance
- ✅ Sets `email_verified = 1` for existing customers

### What Doesn't Change:
- ✅ Existing customer data (email, API keys, passwords, etc.)
- ✅ Existing widget configurations
- ✅ Existing conversations and messages
- ✅ Table structure (no columns removed)
- ✅ Foreign key relationships

## Rollback Procedures

If something goes wrong, follow [rollback-procedures.md](./rollback-procedures.md):

```bash
# Quick rollback (restore from backup)
wrangler d1 execute insertabot-production --file=./backups/insertabot-production_YYYYMMDD_HHMMSS.sql
```

**Note:** This will restore the database to the exact state before migration.

## Troubleshooting

### Error: "duplicate column name"

This is expected for migration 002 if some auth columns already exist. The migration script handles this automatically.

### Error: "no such table"

If you get this for `customers`, `widget_configs`, or other core tables, **STOP** and investigate. The database may be corrupted or you're connected to the wrong database.

### Error: "UNIQUE constraint failed"

This shouldn't happen with this migration since we're only adding columns. If you see this, **STOP** and contact support.

### Migration hangs or times out

Cloudflare D1 has limits on query execution time. If a migration hangs:
1. Check D1 dashboard for status
2. Try running individual migration files instead of the script
3. Check for open transactions or locks

## Post-Migration Tasks

After successful migration:

- [ ] Update documentation with new schema
- [ ] Deploy updated Worker code (if not already deployed)
- [ ] Test new customer registration flow
- [ ] Test email verification flow
- [ ] Monitor error rates in dashboard
- [ ] Archive backup files securely
- [ ] Update team on completion

## Risk Assessment

### Low Risk ✅
- Adding new columns with defaults
- Creating new indexes
- Creating tables that don't exist
- Grandfathering existing customers

### Medium Risk ⚠️
- Running migration during high traffic
- Not having backup
- Not testing endpoints after migration

### High Risk ❌
- Skipping backup step
- Modifying existing columns (we don't do this)
- Deleting data (we don't do this)

## Questions & Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Cloudflare D1 documentation
3. Check Worker error logs: `wrangler tail insertabot-api`
4. Restore from backup if needed

## Migration Checklist

Print this checklist and mark off each step:

```
PRE-MIGRATION
[ ] Reviewed all migration scripts
[ ] Scheduled maintenance window
[ ] Notified team
[ ] Verified wrangler access

BACKUP
[ ] Ran backup-production.sh
[ ] Verified backup file exists
[ ] Verified backup contains data
[ ] Stored backup securely

MIGRATION
[ ] Ran migrate-production.sh
[ ] Migration completed without errors
[ ] Ran validate-schema.sql
[ ] All validation checks passed

TESTING
[ ] Tested existing customer login
[ ] Tested widget loading
[ ] Tested email verification endpoint
[ ] Tested new customer signup
[ ] Checked Worker logs for errors

POST-MIGRATION
[ ] Monitoring error rates
[ ] Documented any issues
[ ] Updated team
[ ] Archived backup
```

## Success Criteria

Migration is considered successful when:

1. ✅ All 9 customers still present in database
2. ✅ All customers have `email_verified = 1`
3. ✅ All required columns exist in `customers` table
4. ✅ All required tables exist (`sessions`, `security_logs`, `knowledge_base`)
5. ✅ All required indexes exist
6. ✅ No orphaned records (widget configs without customers)
7. ✅ Existing customers can authenticate
8. ✅ Widgets load correctly with existing API keys
9. ✅ New customer signup works
10. ✅ Email verification flow works

---

**Last Updated:** 2026-02-02
**Maintained By:** Development Team
**Contact:** See repository contributors
