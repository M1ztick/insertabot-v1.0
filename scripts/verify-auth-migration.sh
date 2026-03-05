#!/bin/bash

# Migration Verification Script
# Verifies that the authentication migration was applied correctly
#
# Usage:
#   ./scripts/verify-auth-migration.sh [local|production]

set -e

ENVIRONMENT="${1:-local}"

echo "🔍 Verifying Authentication Migration"
echo "===================================="
echo ""
echo "Environment: $ENVIRONMENT"
echo ""

# Function to run D1 query
run_query() {
    local query="$1"
    if [ "$ENVIRONMENT" = "local" ]; then
        wrangler d1 execute insertabot-development --local --command="$query"
    else
        wrangler d1 execute insertabot-production --command="$query"
    fi
}

echo "📋 Checking database schema..."
echo ""

# Check customers table has new columns
echo "✓ Checking customers table columns:"
run_query "PRAGMA table_info(customers);" | grep -E "(password_hash|totp_secret|failed_login_attempts)" && echo "  ✅ Authentication columns found" || echo "  ❌ Authentication columns missing"

# Check sessions table exists
echo "✓ Checking sessions table:"
run_query "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions';" | grep -q "sessions" && echo "  ✅ Sessions table exists" || echo "  ❌ Sessions table missing"

# Check security_audit_log table exists
echo "✓ Checking security_audit_log table:"
run_query "SELECT name FROM sqlite_master WHERE type='table' AND name='security_audit_log';" | grep -q "security_audit_log" && echo "  ✅ Audit log table exists" || echo "  ❌ Audit log table missing"

# Check indexes exist
echo "✓ Checking indexes:"
run_query "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%';" | wc -l | xargs echo "  Found indexes:"

echo ""
echo "🧪 Running basic functionality tests..."

# Test session table structure
echo "✓ Testing sessions table structure:"
run_query "SELECT COUNT(*) as count FROM sessions WHERE 1=0;" > /dev/null && echo "  ✅ Sessions table queryable" || echo "  ❌ Sessions table has issues"

# Test audit log table structure
echo "✓ Testing audit log table structure:"
run_query "SELECT COUNT(*) as count FROM security_audit_log WHERE 1=0;" > /dev/null && echo "  ✅ Audit log table queryable" || echo "  ❌ Audit log table has issues"

echo ""
echo "📊 Current data summary:"
run_query "SELECT COUNT(*) as customer_count FROM customers;" | tail -1 | xargs echo "  Customers:"
run_query "SELECT COUNT(*) as session_count FROM sessions;" | tail -1 | xargs echo "  Sessions:"
run_query "SELECT COUNT(*) as audit_count FROM security_audit_log;" | tail -1 | xargs echo "  Audit events:"

echo ""
echo "✅ Migration verification complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Deploy worker: cd worker && wrangler deploy"
echo "  2. Test signup at /signup"
echo "  3. Test login at /login"
echo "  4. Monitor security_audit_log for events"