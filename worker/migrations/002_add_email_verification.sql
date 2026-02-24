-- Migration: Add Email Verification Fields
-- NOTE: The ALTER TABLE statements are intentionally omitted here.
-- These columns (email_verified, email_verification_token, email_verification_expires,
-- email_verification_sent_at) were already added to production via ad-hoc scripts
-- before this Wrangler migration was tracked. Adding them again would fail with
-- "duplicate column name".

-- Recreate the index in case it was dropped by the preceding rollback migration
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(email_verification_token);

-- Grandfather existing customers (idempotent)
UPDATE customers SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0;
