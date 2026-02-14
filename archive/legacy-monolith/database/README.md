# Database Migration Scripts — Execution Order

## Pre-Flight

1. **Back up your Neon database** before running any migration
2. **Test on a Neon branch first** — create a dev branch, run migrations there, verify, then run on production
3. Replace `<USER_API_PASSWORD>` and `<ADMIN_API_PASSWORD>` in `004_create_roles_and_permissions.sql` with strong 32+ character random strings

## Execution Order

```bash
# Connect to Neon as the database owner / superuser
psql "postgresql://<owner>:<password>@<neon-host>/newstrnt?sslmode=require"

# Step 1: Create schemas
\i database/migrations/001_create_schemas.sql

# Step 2: Move user tables to auth schema
\i database/migrations/002_move_auth_tables.sql

# Step 3: Move admin tables to admin schema  
\i database/migrations/003_move_admin_tables.sql

# Step 4: Create roles and grant permissions
\i database/migrations/004_create_roles_and_permissions.sql

# Step 5: Verify everything is correct
\i database/migrations/005_verify_permissions.sql
```

## Post-Migration

After running all migrations:

1. Test connection as `user_api_user`:
   ```bash
   psql "postgresql://user_api_user:<password>@<neon-host>/newstrnt?sslmode=require"
   
   -- Should work:
   SELECT COUNT(*) FROM public.articles;
   SELECT COUNT(*) FROM auth.users;
   
   -- Should FAIL with permission denied:
   SELECT COUNT(*) FROM admin.admin_logs;
   DELETE FROM auth.users WHERE id = 'test';
   ```

2. Test connection as `admin_api_user`:
   ```bash
   psql "postgresql://admin_api_user:<password>@<neon-host>/newstrnt?sslmode=require"
   
   -- Should all work:
   SELECT COUNT(*) FROM public.articles;
   SELECT COUNT(*) FROM auth.users;
   SELECT COUNT(*) FROM admin.admin_logs;
   ```

3. Update Prisma schemas in `apps/user-api/` and `apps/admin-api/` to reflect the new schema locations (use `@@schema()` directive with `multiSchema` preview feature)

## Rollback

If something goes wrong, reverse the table moves:

```sql
-- Rollback auth tables
ALTER TABLE auth.users SET SCHEMA public;
ALTER TABLE auth.saved_articles SET SCHEMA public;
ALTER TABLE auth.reading_history SET SCHEMA public;
ALTER TABLE auth.user_interactions SET SCHEMA public;
ALTER TABLE auth.newsletter_subscriptions SET SCHEMA public;
ALTER TABLE auth.push_tokens SET SCHEMA public;
ALTER TABLE auth.category_follows SET SCHEMA public;
ALTER TABLE auth.topic_follows SET SCHEMA public;

-- Rollback admin tables
ALTER TABLE admin.admin_logs SET SCHEMA public;
ALTER TABLE admin.analytics_events SET SCHEMA public;
ALTER TABLE admin.email_templates SET SCHEMA public;
ALTER TABLE admin.system_backups SET SCHEMA public;
ALTER TABLE admin.ad_requests SET SCHEMA public;
ALTER TABLE admin.ad_campaigns SET SCHEMA public;
ALTER TABLE admin.integrations SET SCHEMA public;
ALTER TABLE admin.spam_rules SET SCHEMA public;
ALTER TABLE admin.security_events SET SCHEMA public;
ALTER TABLE admin.media_files SET SCHEMA public;
ALTER TABLE admin.moderation_reports SET SCHEMA public;
ALTER TABLE admin.system_settings SET SCHEMA public;
ALTER TABLE admin.team_invites SET SCHEMA public;
ALTER TABLE admin.scraper_runs SET SCHEMA public;
ALTER TABLE admin.market_index_configs SET SCHEMA public;
ALTER TABLE admin.cryptocurrency_configs SET SCHEMA public;
ALTER TABLE admin.commodity_configs SET SCHEMA public;
ALTER TABLE admin.currency_pair_configs SET SCHEMA public;
ALTER TABLE admin.market_provider_preferences SET SCHEMA public;

-- Drop roles
DROP ROLE IF EXISTS user_api_user;
DROP ROLE IF EXISTS admin_api_user;

-- Drop schemas
DROP SCHEMA IF EXISTS auth;
DROP SCHEMA IF EXISTS admin;
```
