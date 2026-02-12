-- ============================================================
-- Migration 001: Create PostgreSQL Schemas
-- NewsTRNT Enterprise Module Isolation
-- 
-- Run as superuser / database owner
-- ============================================================

-- Create auth schema (user identity & behavior)
CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'User identity, preferences, and behavior tracking. Accessible by user_api_user (SELECT/INSERT/UPDATE) and admin_api_user (ALL).';

-- Create admin schema (CMS, operations, internal tools)
CREATE SCHEMA IF NOT EXISTS admin;
COMMENT ON SCHEMA admin IS 'CMS operations, admin tools, internal configuration. Accessible ONLY by admin_api_user. Zero access from user-facing services.';

-- public schema already exists by default in PostgreSQL
COMMENT ON SCHEMA public IS 'Published content. Read-heavy, cached. user_api_user has SELECT only (except comments). admin_api_user has ALL.';
