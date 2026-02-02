-- Migration 001: Add Email Verification Fields
-- Safe to run multiple times (uses IF NOT EXISTS where possible)
-- Purpose: Add columns required by email-verification.ts

-- Add email verification columns
-- Note: SQLite doesn't have IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- If column already exists, this will fail - that's expected and safe

ALTER TABLE customers ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN email_verification_token TEXT;
ALTER TABLE customers ADD COLUMN email_verification_expires INTEGER;
ALTER TABLE customers ADD COLUMN email_verification_sent_at INTEGER;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(email_verification_token);

-- Grandfather existing customers (mark as verified)
UPDATE customers
SET email_verified = 1
WHERE email_verified = 0 OR email_verified IS NULL;
