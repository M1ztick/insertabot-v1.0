-- Migration 002: Add Missing Authentication Fields
-- Purpose: Add authentication columns that may be missing from production
-- Note: Some columns may already exist - run one at a time and skip errors

-- These columns should already exist based on audit, but verify:
-- ALTER TABLE customers ADD COLUMN password_hash TEXT;
-- ALTER TABLE customers ADD COLUMN password_salt TEXT;
-- ALTER TABLE customers ADD COLUMN totp_secret TEXT;
-- ALTER TABLE customers ADD COLUMN totp_enabled INTEGER DEFAULT 0;
-- ALTER TABLE customers ADD COLUMN backup_codes TEXT;
-- ALTER TABLE customers ADD COLUMN password_reset_token TEXT;
-- ALTER TABLE customers ADD COLUMN password_reset_expires INTEGER;
-- ALTER TABLE customers ADD COLUMN last_login_at INTEGER;

-- These are more likely to be missing:
ALTER TABLE customers ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN account_locked_until INTEGER;

-- Create index for password reset token
CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON customers(password_reset_token);
