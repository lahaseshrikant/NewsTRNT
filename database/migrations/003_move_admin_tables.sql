-- ============================================================
-- Migration 003: Move admin tables from public → admin schema
-- NewsTRNT Enterprise Module Isolation
--
-- IMPORTANT: Run AFTER 002_move_auth_tables.sql
-- ============================================================

BEGIN;

-- ─── Move CMS & operations tables to admin schema ───

ALTER TABLE public.admin_logs SET SCHEMA admin;
ALTER TABLE public.analytics_events SET SCHEMA admin;
ALTER TABLE public.email_templates SET SCHEMA admin;
ALTER TABLE public.system_backups SET SCHEMA admin;
ALTER TABLE public.ad_requests SET SCHEMA admin;
ALTER TABLE public.ad_campaigns SET SCHEMA admin;
ALTER TABLE public.integrations SET SCHEMA admin;
ALTER TABLE public.spam_rules SET SCHEMA admin;
ALTER TABLE public.security_events SET SCHEMA admin;
ALTER TABLE public.media_files SET SCHEMA admin;
ALTER TABLE public.moderation_reports SET SCHEMA admin;
ALTER TABLE public.system_settings SET SCHEMA admin;
ALTER TABLE public.team_invites SET SCHEMA admin;
ALTER TABLE public.scraper_runs SET SCHEMA admin;
ALTER TABLE public.market_index_configs SET SCHEMA admin;
ALTER TABLE public.cryptocurrency_configs SET SCHEMA admin;
ALTER TABLE public.commodity_configs SET SCHEMA admin;
ALTER TABLE public.currency_pair_configs SET SCHEMA admin;
ALTER TABLE public.market_provider_preferences SET SCHEMA admin;

-- ─── Verify tables moved ───

DO $$
DECLARE
  _count int;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM information_schema.tables
  WHERE table_schema = 'admin'
    AND table_name IN (
      'admin_logs', 'analytics_events', 'email_templates',
      'system_backups', 'ad_requests', 'ad_campaigns',
      'integrations', 'spam_rules', 'security_events',
      'media_files', 'moderation_reports', 'system_settings',
      'team_invites', 'scraper_runs', 'market_index_configs',
      'cryptocurrency_configs', 'commodity_configs',
      'currency_pair_configs', 'market_provider_preferences'
    );
  
  IF _count != 19 THEN
    RAISE EXCEPTION 'Expected 19 tables in admin schema, found %', _count;
  END IF;
  
  RAISE NOTICE '✓ Successfully moved 19 tables to admin schema';
END;
$$;

COMMIT;
