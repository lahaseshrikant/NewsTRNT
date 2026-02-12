-- ============================================================
-- Migration 002: Move auth tables from public → auth schema
-- NewsTRNT Enterprise Module Isolation
--
-- IMPORTANT: Run AFTER 001_create_schemas.sql
-- IMPORTANT: This changes table references — update Prisma schema after
-- ============================================================

BEGIN;

-- ─── Move user identity & behavior tables to auth schema ───

ALTER TABLE public.users SET SCHEMA auth;
ALTER TABLE public.saved_articles SET SCHEMA auth;
ALTER TABLE public.reading_history SET SCHEMA auth;
ALTER TABLE public.user_interactions SET SCHEMA auth;
ALTER TABLE public.newsletter_subscriptions SET SCHEMA auth;
ALTER TABLE public.push_tokens SET SCHEMA auth;
ALTER TABLE public.category_follows SET SCHEMA auth;
ALTER TABLE public.topic_follows SET SCHEMA auth;

-- ─── Verify tables moved ───

DO $$
DECLARE
  _count int;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM information_schema.tables
  WHERE table_schema = 'auth'
    AND table_name IN (
      'users', 'saved_articles', 'reading_history', 
      'user_interactions', 'newsletter_subscriptions',
      'push_tokens', 'category_follows', 'topic_follows'
    );
  
  IF _count != 8 THEN
    RAISE EXCEPTION 'Expected 8 tables in auth schema, found %', _count;
  END IF;
  
  RAISE NOTICE '✓ Successfully moved 8 tables to auth schema';
END;
$$;

COMMIT;
