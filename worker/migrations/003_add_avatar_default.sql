-- Migration: Backfill default avatar URL for existing widget configurations
-- Date: 2026-01-20

UPDATE widget_configs
SET bot_avatar_url = '/insertabot-avatar.png',
    updated_at = strftime('%s', 'now')
WHERE bot_avatar_url IS NULL;
