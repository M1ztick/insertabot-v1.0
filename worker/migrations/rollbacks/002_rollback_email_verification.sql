-- Rollback: Remove Email Verification Fields

-- Drop index
DROP INDEX IF EXISTS idx_customers_verification_token;

-- Remove email verification columns by recreating the table.
-- SQLite does not support DROP COLUMN directly, so we use the backup-and-restore pattern.
-- WARNING: This is destructive. Ensure a backup exists before running in production.

CREATE TABLE customers_backup AS SELECT
    customer_id,
    email,
    company_name,
    api_key,
    plan_type,
    status,
    rate_limit_per_hour,
    rate_limit_per_day,
    rag_enabled,
    stripe_customer_id,
    subscription_id,
    subscription_status,
    created_at,
    updated_at,
    password_hash,
    password_salt,
    totp_secret,
    totp_enabled,
    backup_codes,
    password_reset_token,
    password_reset_expires,
    last_login_at,
    failed_login_attempts,
    account_locked_until
FROM customers;

DROP TABLE customers;

CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    rate_limit_per_hour INTEGER DEFAULT 5,
    rate_limit_per_day INTEGER DEFAULT 20,
    rag_enabled INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    subscription_id TEXT,
    subscription_status TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    password_hash TEXT,
    password_salt TEXT,
    totp_secret TEXT,
    totp_enabled INTEGER DEFAULT 0,
    backup_codes TEXT,
    password_reset_token TEXT,
    password_reset_expires INTEGER,
    last_login_at INTEGER,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until INTEGER
);

INSERT INTO customers SELECT * FROM customers_backup;

DROP TABLE customers_backup;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_api_key ON customers(api_key);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON customers(password_reset_token);
