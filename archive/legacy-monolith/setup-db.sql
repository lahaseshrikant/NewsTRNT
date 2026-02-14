-- Setup database schemas and roles for NewsTRNT
-- Run this against the newstrnt database

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS admin;

-- Create roles
CREATE ROLE "admin" LOGIN PASSWORD 'User@NT#Adi$1875';
CREATE ROLE "user" LOGIN PASSWORD 'Admin@NT#Adi$1875';

-- Grant permissions
-- Admin has access to all schemas
GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;

GRANT USAGE ON SCHEMA auth TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO admin;

GRANT USAGE ON SCHEMA admin TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA admin TO admin;

-- Future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT ALL PRIVILEGES ON TABLES TO admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA admin
GRANT ALL PRIVILEGES ON TABLES TO admin;


-- User has access to auth and public, but not admin
GRANT USAGE ON SCHEMA public TO user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO user;

GRANT USAGE ON SCHEMA auth TO user
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA auth TO user;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT SELECT, INSERT, UPDATE ON TABLES TO user;

REVOKE ALL ON SCHEMA admin FROM user;

-- Grant permissions on tables (will be created later)
-- This can be done after prisma db push