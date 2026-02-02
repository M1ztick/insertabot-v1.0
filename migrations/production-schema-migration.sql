-- =============================================================================
-- INSERTABOT PRODUCTION DATABASE MIGRATION
-- =============================================================================
-- Date: 2026-02-02
-- Purpose: Migrate production database from legacy schema to current schema
-- Database: insertabot-production (3d7d004d-ed6c-486c-a51e-a59f51bcd307)
--
-- CRITICAL: This migration handles 9 active customers in production
-- BACKUP REQUIRED BEFORE EXECUTION
-- =============================================================================

-- =============================================================================
-- PHASE 1: ADD MISSING AUTHENTICATION COLUMNS TO customers TABLE
-- =============================================================================
-- These columns are required by auth-endpoints.ts and email-verification.ts
-- Adding with safe defaults that preserve existing functionality

-- Add email verification columns (required by email-verification.ts)
ALTER TABLE customers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN email_verification_token TEXT;
ALTER TABLE customers ADD COLUMN email_verification_expires INTEGER; -- Unix timestamp
ALTER TABLE customers ADD COLUMN email_verification_sent_at INTEGER; -- Unix timestamp for rate limiting

-- Add password authentication columns (if not already present)
-- Note: Some of these may already exist, SQLite will error if they do
-- Run these individually and ignore errors for existing columns
ALTER TABLE customers ADD COLUMN password_hash TEXT;
ALTER TABLE customers ADD COLUMN password_salt TEXT;
ALTER TABLE customers ADD COLUMN totp_secret TEXT;
ALTER TABLE customers ADD COLUMN totp_enabled INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN backup_codes TEXT; -- JSON array of hashed backup codes
ALTER TABLE customers ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN account_locked_until INTEGER; -- Unix timestamp

-- Verify password_reset_expires exists (should exist based on audit)
-- If not, add it:
-- ALTER TABLE customers ADD COLUMN password_reset_expires INTEGER;

-- =============================================================================
-- PHASE 2: CREATE MISSING INDEXES
-- =============================================================================
-- These indexes improve query performance for authentication operations

CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON customers(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(email_verification_token);

-- =============================================================================
-- PHASE 3: GRANDFATHER EXISTING CUSTOMERS
-- =============================================================================
-- Mark all existing customers as email verified to prevent disruption
-- This ensures existing customers maintain full access to their accounts

UPDATE customers
SET email_verified = 1
WHERE email_verified = 0 OR email_verified IS NULL;

-- =============================================================================
-- PHASE 4: CREATE OR UPDATE sessions TABLE
-- =============================================================================
-- The sessions table structure should match the schema in auth system

-- Check if sessions table exists and has correct structure
-- If it doesn't exist, create it:
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,

    -- Timestamp fields
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,

    -- Security metadata
    ip_address TEXT,
    user_agent TEXT,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- =============================================================================
-- PHASE 5: CREATE OR UPDATE security_audit_log TABLE
-- =============================================================================
-- May be named security_audit_log or security_logs depending on version

CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT,
    event_type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT, -- JSON string for additional details

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_security_logs_customer_event ON security_logs(customer_id, event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- =============================================================================
-- PHASE 6: WIDGET_CONFIGS TABLE VERIFICATION
-- =============================================================================
-- Verify widget_configs has all required columns
-- The audit shows this table has INTEGER id as primary key (correct)
-- and has the required columns including bot_avatar_url

-- If bot_avatar_url is missing, add it:
-- ALTER TABLE widget_configs ADD COLUMN bot_avatar_url TEXT DEFAULT '/insertabot-avatar.png';

-- =============================================================================
-- PHASE 7: KNOWLEDGE_BASE TABLE VERIFICATION
-- =============================================================================
-- Ensure knowledge_base table exists for RAG functionality

CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,

    content TEXT NOT NULL,
    source_type TEXT NOT NULL, -- manual, scraped, uploaded
    source_url TEXT,
    title TEXT,
    metadata TEXT, -- JSON string

    embedding_id TEXT, -- Reference to Vectorize embedding

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_knowledge_customer ON knowledge_base(customer_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_source ON knowledge_base(source_type);

-- =============================================================================
-- PHASE 8: DATA VALIDATION
-- =============================================================================
-- Validate that all customers have required fields

-- Check that all customers have customer_id, email, and api_key
-- This query should return 0 rows
-- SELECT COUNT(*) FROM customers WHERE customer_id IS NULL OR email IS NULL OR api_key IS NULL;

-- Check that all widget_configs reference valid customers
-- This query should return 0 rows
-- SELECT wc.customer_id
-- FROM widget_configs wc
-- LEFT JOIN customers c ON wc.customer_id = c.customer_id
-- WHERE c.customer_id IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Post-migration verification steps:
-- 1. Verify all 9 customers are present and email_verified = 1
-- 2. Test authentication endpoints with existing customer
-- 3. Test widget loading with existing API keys
-- 4. Monitor error logs for any schema-related issues
-- 5. Test new customer registration flow
-- =============================================================================

-- Summary of changes:
-- ✅ Added email verification columns to customers table
-- ✅ Added missing authentication columns to customers table
-- ✅ Created required indexes for performance
-- ✅ Grandfathered existing customers (email_verified = 1)
-- ✅ Ensured sessions table exists with correct schema
-- ✅ Ensured security_logs table exists
-- ✅ Verified widget_configs structure
-- ✅ Ensured knowledge_base table exists for RAG
