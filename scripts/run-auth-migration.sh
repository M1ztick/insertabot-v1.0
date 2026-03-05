#!/bin/bash

# Authentication Migration Script
# Applies database schema changes for password and 2FA authentication
#
# Usage:
#   ./scripts/run-auth-migration.sh [local|production]
#
# Examples:
#   ./scripts/run-auth-migration.sh local       # Apply to local D1 database
#   ./scripts/run-auth-migration.sh production  # Apply to production D1 database

set -e  # Exit on error

ENVIRONMENT="${1:-local}"
MIGRATION_FILE="migrations/001_add_auth_fields.sql"

echo "🔒 Insertabot Authentication Migration"
echo "======================================"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Migration file: $MIGRATION_FILE"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo "📋 Migration Summary:"
echo "  - Add password authentication fields"
echo "  - Add 2FA/TOTP fields"
echo "  - Create sessions table"
echo "  - Create security_audit_log table"
echo "  - Add account lockout protection fields"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "⚠️  WARNING: You are about to modify the PRODUCTION database!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "❌ Migration cancelled"
        exit 1
    fi
fi

echo "🚀 Applying migration..."
echo ""

if [ "$ENVIRONMENT" = "local" ]; then
    # Apply to local D1 database
    wrangler d1 execute insertabot-development --local --file="$MIGRATION_FILE"
else
    # Apply to production D1 database
    wrangler d1 execute insertabot-production --file="$MIGRATION_FILE"
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "  1. Test authentication locally"
echo "  2. Deploy updated worker: wrangler deploy"
echo "  3. Test login and signup in production"
echo "  4. Review security audit logs"
echo ""
echo "📚 Documentation: docs/AUTHENTICATION-SECURITY.md"
echo ""
