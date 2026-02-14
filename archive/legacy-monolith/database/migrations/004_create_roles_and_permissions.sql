-- ============================================================
-- Migration 004: Create database roles with strict permissions
-- NewsTRNT Enterprise Module Isolation
--
-- IMPORTANT: Run AFTER 003_move_admin_tables.sql
-- IMPORTANT: Replace <USER_API_PASSWORD> and <ADMIN_API_PASSWORD>
--            with strong 32+ character random strings before running
-- ============================================================

BEGIN;

-- ============================================================
-- ROLE: user_api_user
-- Used by: User Backend (apps/user-api)
-- Access: public (SELECT), auth (SELECT/INSERT/UPDATE), admin (NONE)
-- ============================================================

-- Create role (skip if exists for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'user_api_user') THEN
    CREATE ROLE user_api_user WITH
      LOGIN
      PASSWORD '<USER_API_PASSWORD>'
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 50;
    RAISE NOTICE '✓ Created role user_api_user';
  ELSE
    RAISE NOTICE '⚠ Role user_api_user already exists, skipping creation';
  END IF;
END;
$$;

-- ─── public schema: READ ONLY (with exception for comments) ───

GRANT USAGE ON SCHEMA public TO user_api_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO user_api_user;

-- Exception: comments table needs INSERT + UPDATE for user-posted comments
GRANT INSERT, UPDATE ON public.comments TO user_api_user;

-- Sequence access for comments (auto-increment id)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO user_api_user;

-- ─── auth schema: READ + INSERT + UPDATE (no DELETE) ───

GRANT USAGE ON SCHEMA auth TO user_api_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA auth TO user_api_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO user_api_user;

-- ─── admin schema: ZERO ACCESS ───
-- (intentionally no GRANT — default is no access)

-- ─── Exception: user can DELETE own saved_articles and follows ───
GRANT DELETE ON auth.saved_articles TO user_api_user;
GRANT DELETE ON auth.category_follows TO user_api_user;
GRANT DELETE ON auth.topic_follows TO user_api_user;


-- ============================================================
-- ROLE: admin_api_user
-- Used by: Admin Backend (apps/admin-api), Scraper (scraper-ai)
-- Access: ALL schemas, ALL privileges
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_api_user') THEN
    CREATE ROLE admin_api_user WITH
      LOGIN
      PASSWORD '<ADMIN_API_PASSWORD>'
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 20;
    RAISE NOTICE '✓ Created role admin_api_user';
  ELSE
    RAISE NOTICE '⚠ Role admin_api_user already exists, skipping creation';
  END IF;
END;
$$;

-- Full access to ALL schemas
GRANT ALL PRIVILEGES ON SCHEMA public TO admin_api_user;
GRANT ALL PRIVILEGES ON SCHEMA auth TO admin_api_user;
GRANT ALL PRIVILEGES ON SCHEMA admin TO admin_api_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO admin_api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA admin TO admin_api_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO admin_api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA admin TO admin_api_user;


-- ============================================================
-- DEFAULT PRIVILEGES: Ensure future tables inherit permissions
-- ============================================================

-- user_api_user: future public tables → SELECT only
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO user_api_user;

-- user_api_user: future auth tables → SELECT, INSERT, UPDATE
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT, INSERT, UPDATE ON TABLES TO user_api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT USAGE, SELECT ON SEQUENCES TO user_api_user;

-- user_api_user: future public sequences → USAGE (for inserts)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO user_api_user;

-- admin_api_user: future tables in ALL schemas → ALL
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO admin_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT ALL PRIVILEGES ON TABLES TO admin_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin
  GRANT ALL PRIVILEGES ON TABLES TO admin_api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO admin_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT ALL PRIVILEGES ON SEQUENCES TO admin_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin
  GRANT ALL PRIVILEGES ON SEQUENCES TO admin_api_user;


COMMIT;
