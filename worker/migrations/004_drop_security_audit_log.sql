-- Migration: Drop orphaned security_audit_log table
-- Date: 2026-02-24
-- Reason: This table was created by migration 001 under the wrong name.
-- The correct table is security_logs (used by security-audit.ts).
-- security_audit_log was never written to by application code.

DROP TABLE IF EXISTS security_audit_log;
