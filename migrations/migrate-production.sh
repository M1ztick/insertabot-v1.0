#!/bin/bash

# =============================================================================
# Production Database Migration Script
# =============================================================================
# This script applies schema migrations to the production database
# REQUIRES: Backup must be created first (run backup-production.sh)
# Usage: ./migrate-production.sh
# =============================================================================

set -e  # Exit on any error

DATABASE_NAME="insertabot-production"
MIGRATION_DIR="."

echo "==================================================================="
echo "Insertabot Production Database Migration"
echo "==================================================================="
echo "Database: ${DATABASE_NAME}"
echo "Migration Directory: ${MIGRATION_DIR}"
echo "==================================================================="
echo ""

# Check if backup exists
BACKUP_COUNT=$(ls -1 ./backups/insertabot-production_*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No backup found!"
    echo "Please run ./backup-production.sh first"
    exit 1
fi

LATEST_BACKUP=$(ls -1t ./backups/insertabot-production_*.sql | head -1)
echo "✅ Found backup: ${LATEST_BACKUP}"
echo ""

# Confirm before proceeding
echo "⚠️  WARNING: This will modify the production database"
echo ""
read -p "Have you reviewed the migration scripts? (yes/no): " CONFIRM1
if [ "$CONFIRM1" != "yes" ]; then
    echo "Migration cancelled"
    exit 0
fi

read -p "Are you sure you want to proceed? (yes/no): " CONFIRM2
if [ "$CONFIRM2" != "yes" ]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "==================================================================="
echo "Starting Migration"
echo "==================================================================="
echo ""

# Function to execute a migration
execute_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")

    echo "-------------------------------------------------------------------"
    echo "Executing: ${migration_name}"
    echo "-------------------------------------------------------------------"

    if wrangler d1 execute "${DATABASE_NAME}" --file="${migration_file}"; then
        echo "✅ ${migration_name} completed successfully"
    else
        echo "❌ ${migration_name} failed"
        echo ""
        echo "Migration failed! Check error above."
        echo "Your data is safe - restore from backup if needed:"
        echo "  wrangler d1 execute ${DATABASE_NAME} --file=${LATEST_BACKUP}"
        exit 1
    fi

    echo ""
}

# Execute migrations in order
echo "Step 1: Add Email Verification Fields"
execute_migration "${MIGRATION_DIR}/001-add-email-verification-fields.sql"

echo "Step 2: Add Missing Authentication Fields"
# This one might fail if columns already exist - that's OK
if wrangler d1 execute "${DATABASE_NAME}" --file="${MIGRATION_DIR}/002-add-missing-auth-fields.sql" 2>&1 | tee /tmp/migration_002.log; then
    echo "✅ Migration 002 completed"
else
    if grep -q "duplicate column name" /tmp/migration_002.log; then
        echo "⚠️  Some columns already exist - this is expected, continuing..."
    else
        echo "❌ Migration 002 failed with unexpected error"
        cat /tmp/migration_002.log
        exit 1
    fi
fi
echo ""

echo "Step 3: Verify Required Tables Exist"
execute_migration "${MIGRATION_DIR}/003-verify-tables-exist.sql"

echo "==================================================================="
echo "Migration Complete!"
echo "==================================================================="
echo ""
echo "Next steps:"
echo "1. Run validation: wrangler d1 execute ${DATABASE_NAME} --file=validate-schema.sql"
echo "2. Test authentication endpoints"
echo "3. Test widget loading"
echo "4. Monitor error logs"
echo "==================================================================="
