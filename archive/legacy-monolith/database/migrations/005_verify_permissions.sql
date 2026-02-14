-- ============================================================
-- Migration 005: Verify role permissions are correctly applied
-- NewsTRNT Enterprise Module Isolation
--
-- Run this AFTER 004_create_roles_and_permissions.sql
-- This is a READ-ONLY verification script — it makes no changes
-- ============================================================

-- ─── Test 1: user_api_user should be able to SELECT from public tables ───
DO $$
BEGIN
  -- Check public schema access
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE grantee = 'user_api_user'
      AND table_schema = 'public'
      AND privilege_type = 'SELECT'
      AND table_name = 'articles'
  ) THEN
    RAISE EXCEPTION 'FAIL: user_api_user cannot SELECT from public.articles';
  END IF;
  RAISE NOTICE '✓ Test 1 PASSED: user_api_user can SELECT from public.articles';
END;
$$;

-- ─── Test 2: user_api_user should be able to INSERT into auth tables ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE grantee = 'user_api_user'
      AND table_schema = 'auth'
      AND privilege_type = 'INSERT'
      AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'FAIL: user_api_user cannot INSERT into auth.users';
  END IF;
  RAISE NOTICE '✓ Test 2 PASSED: user_api_user can INSERT into auth.users';
END;
$$;

-- ─── Test 3: user_api_user should NOT have access to admin schema ───
DO $$
DECLARE
  _count int;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM information_schema.role_table_grants
  WHERE grantee = 'user_api_user'
    AND table_schema = 'admin';
  
  IF _count > 0 THEN
    RAISE EXCEPTION 'FAIL: user_api_user has % grants on admin schema — should be ZERO', _count;
  END IF;
  RAISE NOTICE '✓ Test 3 PASSED: user_api_user has ZERO access to admin schema';
END;
$$;

-- ─── Test 4: user_api_user should NOT have DELETE on auth tables (except saved_articles, category_follows, topic_follows) ───
DO $$
DECLARE
  _count int;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM information_schema.role_table_grants
  WHERE grantee = 'user_api_user'
    AND table_schema = 'auth'
    AND privilege_type = 'DELETE'
    AND table_name NOT IN ('saved_articles', 'category_follows', 'topic_follows');
  
  IF _count > 0 THEN
    RAISE EXCEPTION 'FAIL: user_api_user has DELETE on % auth tables (expected only saved_articles, category_follows, topic_follows)', _count;
  END IF;
  RAISE NOTICE '✓ Test 4 PASSED: user_api_user has no unauthorized DELETE on auth tables';
END;
$$;

-- ─── Test 5: admin_api_user should have full access to ALL schemas ───
DO $$
DECLARE
  _public_count int;
  _auth_count int;
  _admin_count int;
BEGIN
  SELECT COUNT(DISTINCT table_name) INTO _public_count
  FROM information_schema.role_table_grants
  WHERE grantee = 'admin_api_user' AND table_schema = 'public';
  
  SELECT COUNT(DISTINCT table_name) INTO _auth_count
  FROM information_schema.role_table_grants
  WHERE grantee = 'admin_api_user' AND table_schema = 'auth';
  
  SELECT COUNT(DISTINCT table_name) INTO _admin_count
  FROM information_schema.role_table_grants
  WHERE grantee = 'admin_api_user' AND table_schema = 'admin';
  
  IF _public_count = 0 OR _auth_count = 0 OR _admin_count = 0 THEN
    RAISE EXCEPTION 'FAIL: admin_api_user missing access — public: %, auth: %, admin: %', _public_count, _auth_count, _admin_count;
  END IF;
  
  RAISE NOTICE '✓ Test 5 PASSED: admin_api_user has access to public (% tables), auth (% tables), admin (% tables)', _public_count, _auth_count, _admin_count;
END;
$$;

-- ─── Test 6: user_api_user can INSERT + UPDATE on public.comments ───
DO $$
DECLARE
  _insert_ok boolean;
  _update_ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE grantee = 'user_api_user'
      AND table_schema = 'public'
      AND table_name = 'comments'
      AND privilege_type = 'INSERT'
  ) INTO _insert_ok;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE grantee = 'user_api_user'
      AND table_schema = 'public'
      AND table_name = 'comments'
      AND privilege_type = 'UPDATE'
  ) INTO _update_ok;
  
  IF NOT _insert_ok OR NOT _update_ok THEN
    RAISE EXCEPTION 'FAIL: user_api_user cannot INSERT/UPDATE on public.comments (INSERT: %, UPDATE: %)', _insert_ok, _update_ok;
  END IF;
  RAISE NOTICE '✓ Test 6 PASSED: user_api_user can INSERT + UPDATE on public.comments';
END;
$$;

-- ─── Summary ───
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════';
  RAISE NOTICE '  ALL PERMISSION TESTS PASSED';
  RAISE NOTICE '══════════════════════════════════════════════════';
  RAISE NOTICE '';
END;
$$;
