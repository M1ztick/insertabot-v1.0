# Rollback Procedures

**Emergency rollback guide for production database migration**

## When to Rollback

Rollback immediately if you observe:

- ❌ Customer authentication completely broken
- ❌ Data loss detected (customer count changed)
- ❌ Widget loading fails for all customers
- ❌ Database corruption errors
- ❌ Critical application errors affecting all users

## Rollback Methods

### Method 1: Full Database Restore (Safest)

Restores entire database to pre-migration state.

```bash
# Find your backup file
ls -lh ./backups/insertabot-production_*.sql

# Restore from backup
BACKUP_FILE="./backups/insertabot-production_20260202_143000.sql"  # Use your actual backup
wrangler d1 execute insertabot-production --file="${BACKUP_FILE}"
```

**Time:** ~2-5 minutes depending on database size
**Impact:** Reverts ALL changes since backup was taken
**Data Loss:** Any new customers/changes after backup are lost

### Method 2: Selective Rollback (Partial)

Only removes the added columns (more complex, use only if needed).

⚠️ **Warning:** This is more risky than full restore. Only use if you have specific reasons not to do full restore.

```bash
# Create rollback script
cat > rollback-columns.sql << 'EOF'
-- Remove email verification columns
-- Note: SQLite doesn't support DROP COLUMN easily
-- This creates a new table without the columns, copies data, then renames

-- For customers table, this is complex - recommend full restore instead
-- If you must do partial rollback, backup first and test in development

SELECT 'Partial rollback not recommended - use full database restore' as warning;
EOF

# It's better to use Method 1 (full restore)
```

### Method 3: Emergency Stop (Prevent Further Damage)

If migration is actively running and causing issues:

```bash
# 1. Stop the migration script if still running
Ctrl+C

# 2. Check if there are any pending migrations
wrangler d1 list

# 3. Verify database state
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) FROM customers;"

# 4. Decide: Full restore or continue?
```

## Rollback Decision Tree

```
Is data corrupted or lost?
├─ YES → Full restore (Method 1) IMMEDIATELY
└─ NO → Continue to next check

Are customers unable to access their accounts?
├─ ALL customers affected → Full restore (Method 1)
└─ Some customers affected → Investigate first, may not need rollback

Are there database errors in logs?
├─ Critical errors → Full restore (Method 1)
└─ Minor errors → Investigate, possibly continue with fixes

Is it just missing features?
└─ No rollback needed → Deploy updated Worker code
```

## Step-by-Step Rollback Process

### Step 1: Assess the Situation

```bash
# Check customer count (should be 9)
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) as count FROM customers;"

# Check if any customers lost data
wrangler d1 execute insertabot-production --command="SELECT customer_id, email, api_key FROM customers LIMIT 10;"

# Check recent error logs
wrangler tail insertabot-api --format=json | grep -i error
```

### Step 2: Create Emergency Backup (even if rolling back)

```bash
# Create backup of current state before rollback
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
wrangler d1 export insertabot-production --output="./backups/pre-rollback_${TIMESTAMP}.sql"
```

### Step 3: Execute Rollback

```bash
# Use the most recent pre-migration backup
BACKUP_FILE=$(ls -1t ./backups/insertabot-production_*.sql | grep -v pre-rollback | head -1)

echo "Restoring from: ${BACKUP_FILE}"
echo "This will revert all changes since backup was taken"
read -p "Confirm rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" = "yes" ]; then
    wrangler d1 execute insertabot-production --file="${BACKUP_FILE}"
    echo "✅ Rollback complete"
else
    echo "Rollback cancelled"
fi
```

### Step 4: Verify Rollback

```bash
# Verify customer count is correct (9)
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) as count FROM customers;"

# Verify email_verified column doesn't exist (should error)
wrangler d1 execute insertabot-production --command="SELECT email_verified FROM customers LIMIT 1;" 2>&1 | grep "no such column" && echo "✅ Rollback verified - column removed"

# Test authentication
curl -X POST https://insertabot.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Step 5: Notify Team

```bash
# Send notification
echo "Database rolled back at $(date)"
echo "Reason: [FILL IN REASON]"
echo "Next steps: Investigate issue, fix migration, try again"
```

## Common Rollback Scenarios

### Scenario 1: Migration Failed Halfway

**Symptoms:**
- Some tables updated, others not
- Inconsistent schema state
- Errors about missing columns in some queries

**Solution:** Full restore (Method 1)

```bash
# Restore from backup - this will ensure consistent state
./rollback-from-backup.sh
```

### Scenario 2: Migration Completed but App Broken

**Symptoms:**
- Migration script reported success
- But authentication/widgets not working
- Errors in Worker logs

**Investigation first:**
```bash
# Check if it's a Worker code issue, not database issue
wrangler tail insertabot-api

# If Worker code is the issue, deploy older Worker version instead of database rollback
wrangler deploy --config wrangler.toml.backup
```

**If database is the issue:** Full restore (Method 1)

### Scenario 3: Data Loss Detected

**Symptoms:**
- Customer count changed
- Missing records

**IMMEDIATE ACTION:** Full restore (Method 1)

```bash
# Don't investigate, restore immediately
wrangler d1 execute insertabot-production --file="./backups/[BACKUP_FILE]"

# Then investigate what went wrong in safe environment
```

### Scenario 4: Performance Issues After Migration

**Symptoms:**
- Queries running slow
- Timeouts

**Investigation:**
```bash
# Check if new indexes were created
wrangler d1 execute insertabot-production --command="SELECT name FROM sqlite_master WHERE type='index';"

# This might not require rollback - could be index building or need query optimization
```

**If performance is unacceptable:** Full restore (Method 1), optimize migration, try again

## Testing After Rollback

After rollback, verify:

```bash
# 1. Customer count correct
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) FROM customers;"

# 2. Authentication works
curl -X POST https://insertabot.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Widgets load
curl https://insertabot.io/api/config/widget \
  -H "Authorization: Bearer ib_sk_..."

# 4. No errors in logs
wrangler tail insertabot-api --format=json | grep -i error
```

## Rollback Recovery Time

| Method | Time | Complexity | Risk |
|--------|------|------------|------|
| Full Restore | 2-5 min | Low | Very Low |
| Selective | 10-30 min | High | Medium |
| Emergency Stop | Immediate | Low | Low |

## What Happens to Data After Rollback?

### Data Preserved:
- ✅ All customer records (as they were at backup time)
- ✅ All widget configs
- ✅ All conversations and messages
- ✅ All API keys

### Data Lost:
- ❌ Any new customers created after backup
- ❌ Any configuration changes after backup
- ❌ Any new conversations after backup

**Important:** If you need to preserve data created after backup, you must:
1. Export that data before rollback
2. Re-import after rollback
3. This is complex and error-prone - avoid if possible

## Post-Rollback Actions

1. **Notify users** (if any were affected)
2. **Document what went wrong**
3. **Fix the migration scripts**
4. **Test in development environment**
5. **Schedule new migration attempt**

## Prevention

To avoid needing rollback:

- ✅ Always create backup before migration
- ✅ Test migrations in development first
- ✅ Review migration scripts carefully
- ✅ Run during low-traffic periods
- ✅ Monitor actively during migration
- ✅ Have rollback plan ready
- ✅ Test rollback procedure in development

## Quick Reference Commands

```bash
# Check database status
wrangler d1 info insertabot-production

# Check customer count
wrangler d1 execute insertabot-production --command="SELECT COUNT(*) FROM customers;"

# Full restore
wrangler d1 execute insertabot-production --file="./backups/[BACKUP_FILE]"

# Check logs
wrangler tail insertabot-api

# List backups
ls -lht ./backups/
```

## Emergency Contacts

If rollback fails or you need help:

1. Check Cloudflare D1 status: https://www.cloudflarestatus.com/
2. Review Cloudflare D1 docs: https://developers.cloudflare.com/d1/
3. Check Worker logs for detailed errors
4. Consult with database expert if available

## Rollback Checklist

```
BEFORE ROLLBACK
[ ] Assessed the issue severity
[ ] Confirmed rollback is necessary
[ ] Created emergency backup of current state
[ ] Located pre-migration backup file
[ ] Notified team of rollback decision

DURING ROLLBACK
[ ] Executed restore from backup
[ ] Verified restore completed without errors
[ ] Checked customer count
[ ] Tested authentication
[ ] Tested widget loading

AFTER ROLLBACK
[ ] All tests passing
[ ] No errors in logs
[ ] Customers can access accounts
[ ] Documented what went wrong
[ ] Created plan to fix and retry
[ ] Notified team of completion
```

---

**Remember:** When in doubt, restore from backup. It's better to lose a few minutes of new data than to corrupt the entire database trying to fix issues.
