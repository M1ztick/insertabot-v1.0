-- =============================================================================
-- Schema Validation Queries
-- =============================================================================
-- Run these queries to verify the database schema is correct after migration
-- All counts should be as expected, no missing data
-- =============================================================================

-- =============================================================================
-- 1. VERIFY CUSTOMER COUNT
-- =============================================================================
-- Expected: 9 customers (from audit report)
SELECT 'Customer Count:' as check_name, COUNT(*) as count FROM customers;

-- =============================================================================
-- 2. VERIFY EMAIL VERIFICATION FIELDS EXIST
-- =============================================================================
-- All customers should have email_verified = 1 after migration
SELECT
    'Email Verified Count:' as check_name,
    COUNT(*) as verified_count,
    (SELECT COUNT(*) FROM customers WHERE email_verified = 0) as unverified_count
FROM customers
WHERE email_verified = 1;

-- =============================================================================
-- 3. CHECK FOR NULL CRITICAL FIELDS
-- =============================================================================
-- Should return 0 rows
SELECT 'Customers with NULL critical fields:' as check_name, COUNT(*) as count
FROM customers
WHERE customer_id IS NULL
   OR email IS NULL
   OR api_key IS NULL;

-- =============================================================================
-- 4. VERIFY WIDGET CONFIGS
-- =============================================================================
-- Should match customer count (or close to it)
SELECT 'Widget Config Count:' as check_name, COUNT(*) as count FROM widget_configs;

-- Verify all widget_configs reference valid customers (should return 0 rows)
SELECT
    'Orphaned Widget Configs:' as check_name,
    COUNT(*) as count
FROM widget_configs wc
LEFT JOIN customers c ON wc.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- =============================================================================
-- 5. VERIFY TABLE EXISTENCE
-- =============================================================================
-- List all tables in database
SELECT 'All Tables:' as info, name as table_name
FROM sqlite_master
WHERE type='table'
  AND name NOT LIKE 'sqlite_%'
  AND name NOT LIKE '_cf_%'
ORDER BY name;

-- =============================================================================
-- 6. VERIFY REQUIRED COLUMNS IN customers TABLE
-- =============================================================================
-- Show all columns in customers table
SELECT 'customers Table Columns:' as info, sql
FROM sqlite_master
WHERE type='table' AND name='customers';

-- =============================================================================
-- 7. VERIFY INDEXES
-- =============================================================================
-- List all indexes
SELECT 'Indexes:' as info, name as index_name, tbl_name as table_name
FROM sqlite_master
WHERE type='index'
  AND name NOT LIKE 'sqlite_%'
ORDER BY tbl_name, name;

-- =============================================================================
-- 8. CHECK SESSIONS TABLE
-- =============================================================================
SELECT 'Sessions Count:' as check_name, COUNT(*) as count FROM sessions;

-- Check for expired sessions that should be cleaned up
SELECT
    'Expired Sessions:' as check_name,
    COUNT(*) as count
FROM sessions
WHERE expires_at < strftime('%s', 'now');

-- =============================================================================
-- 9. CHECK SECURITY LOGS
-- =============================================================================
SELECT 'Security Logs Count:' as check_name, COUNT(*) as count FROM security_logs;

-- Show event type distribution
SELECT
    'Security Event Types:' as info,
    event_type,
    COUNT(*) as count
FROM security_logs
GROUP BY event_type
ORDER BY count DESC;

-- =============================================================================
-- 10. CHECK KNOWLEDGE BASE
-- =============================================================================
SELECT 'Knowledge Base Entries:' as check_name, COUNT(*) as count FROM knowledge_base;

-- =============================================================================
-- 11. VERIFY DATA INTEGRITY
-- =============================================================================
-- Check for customers without widget configs
SELECT
    'Customers without Widget Config:' as check_name,
    COUNT(*) as count
FROM customers c
LEFT JOIN widget_configs wc ON c.customer_id = wc.customer_id
WHERE wc.customer_id IS NULL;

-- =============================================================================
-- 12. SAMPLE DATA CHECK
-- =============================================================================
-- Show sample customer data (masked for security)
SELECT
    'Sample Customer Data:' as info,
    customer_id,
    SUBSTR(email, 1, 3) || '***' || SUBSTR(email, INSTR(email, '@'), 100) as email_masked,
    company_name,
    plan_type,
    status,
    email_verified,
    totp_enabled,
    CASE WHEN password_hash IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as password_status
FROM customers
LIMIT 3;

-- =============================================================================
-- VALIDATION COMPLETE
-- =============================================================================
-- Review all output to ensure:
-- ✅ Customer count is correct (9 expected)
-- ✅ All customers have email_verified = 1
-- ✅ No NULL critical fields
-- ✅ Widget configs exist and reference valid customers
-- ✅ All required tables exist
-- ✅ All required indexes exist
-- ✅ No orphaned records
-- =============================================================================
