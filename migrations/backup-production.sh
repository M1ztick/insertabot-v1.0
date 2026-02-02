#!/bin/bash

# =============================================================================
# Production Database Backup Script
# =============================================================================
# This script backs up the production database before migration
# Usage: ./backup-production.sh
# =============================================================================

set -e  # Exit on any error

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DATABASE_ID="3d7d004d-ed6c-486c-a51e-a59f51bcd307"
DATABASE_NAME="insertabot-production"
BACKUP_FILE="${BACKUP_DIR}/insertabot-production_${TIMESTAMP}.sql"

echo "==================================================================="
echo "Insertabot Production Database Backup"
echo "==================================================================="
echo "Database: ${DATABASE_NAME}"
echo "Database ID: ${DATABASE_ID}"
echo "Timestamp: ${TIMESTAMP}"
echo "Backup file: ${BACKUP_FILE}"
echo "==================================================================="
echo ""

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Step 1: Exporting database..."
wrangler d1 export "${DATABASE_NAME}" --output="${BACKUP_FILE}"

if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    echo "❌ Backup failed - file not created"
    exit 1
fi

echo ""
echo "Step 2: Verifying backup integrity..."

# Check if backup file is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
    echo "❌ Backup file is empty!"
    exit 1
fi

# Check if backup contains expected tables
EXPECTED_TABLES=("customers" "widget_configs" "sessions" "security_audit_log" "knowledge_base")
MISSING_TABLES=()

for table in "${EXPECTED_TABLES[@]}"; do
    if grep -q "CREATE TABLE.*${table}" "${BACKUP_FILE}"; then
        echo "✅ Found table: ${table}"
    else
        MISSING_TABLES+=("${table}")
        echo "⚠️  Table not found in backup: ${table}"
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: Some expected tables are missing from backup"
    echo "Missing tables: ${MISSING_TABLES[*]}"
    echo "This may be normal if these tables don't exist yet in production"
fi

echo ""
echo "Step 3: Creating compressed backup..."
gzip -c "${BACKUP_FILE}" > "${BACKUP_FILE}.gz"

if [ -f "${BACKUP_FILE}.gz" ]; then
    COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "✅ Compressed backup created: ${BACKUP_FILE}.gz (${COMPRESSED_SIZE})"
else
    echo "⚠️  Compression failed, but uncompressed backup exists"
fi

echo ""
echo "==================================================================="
echo "Backup Summary"
echo "==================================================================="
echo "Uncompressed: ${BACKUP_FILE} (${BACKUP_SIZE})"
if [ -f "${BACKUP_FILE}.gz" ]; then
    echo "Compressed:   ${BACKUP_FILE}.gz (${COMPRESSED_SIZE})"
fi
echo ""
echo "✅ BACKUP COMPLETE"
echo ""
echo "Next steps:"
echo "1. Review the backup file to ensure it contains all data"
echo "2. Test restore procedure in development environment"
echo "3. Proceed with migration using: ./migrate-production.sh"
echo "==================================================================="
