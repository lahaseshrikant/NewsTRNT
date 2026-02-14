# NewsTRNT Architecture Audit & Migration Status

> **Date**: February 2026  
> **Status**: Migration In Progress  
> **Monolith Root**: `src/` (intact — do NOT delete until all modules verified working)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Root Directory Structure](#root-directory-structure)
3. [Module Structure](#module-structure)
4. [src/app/ — Pages Audit](#srcapp--pages-audit)
5. [src/app/api/ — API Routes Audit](#srcappapi--api-routes-audit)
6. [src/lib/ — Library Files Audit](#srclib--library-files-audit)
7. [src/components/ — Components Audit](#srccomponents--components-audit)
8. [src/hooks/ — Hooks Audit](#srchooks--hooks-audit)
9. [src/contexts/ — Contexts Audit](#srccontexts--contexts-audit)
10. [src/config/ — Config Audit](#srcconfig--config-audit)
11. [src/types/ — Types Audit](#srctypes--types-audit)
12. [src/styles/ — Styles Audit](#srcstyles--styles-audit)
13. [backend/ — Original Monolith Backend](#backend--original-monolith-backend)
14. [Other Root Directories](#other-root-directories)
15. [Root Config Files](#root-config-files)
16. [Actions Taken](#actions-taken)
17. [Remaining Work](#remaining-work)
18. [Dependency Leak Warnings](#dependency-leak-warnings)

---

## Architecture Overview

```
news-platform/                          ← Monorepo root
├── apps/
│   ├── user-frontend/                  ← Next.js reader app (port 3000)
│   └── admin-frontend/                 ← Next.js admin CMS (port 3001)
├── services/
│   ├── user-backend/                   ← Express reader API (port 5000)
│   └── admin-backend/                  ← Express admin API (port 5002)
├── scraper-ai/                         ← Python AI scraping pipeline
├── backend/                            ← Original monolith backend (DEPRECATED)
├── src/                                ← Original monolith frontend (DEPRECATED)
├── docker-compose.yml                  ← Orchestrates all services
└── ...config files
```

### Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| `user-frontend` | 3000 | Reader-facing Next.js app |
| `admin-frontend` | 3001 | Admin CMS Next.js app |
| `user-backend` | 5000 | Reader-facing Express API |
| `admin-backend` | 5002 | Admin Express API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & pub/sub |

---

## Root Directory Structure

```
news-platform/
├── .env.example              ← Master env template (KEEP)
├── .gitignore                ← Comprehensive ignore rules (KEEP)
├── docker-compose.yml        ← Full stack orchestration (KEEP)
├── eslint.config.mjs         ← Shared workspace lint (KEEP)
├── README.md                 ← Project readme (KEEP)
├── CONTRIBUTING.md           ← Contribution guide (KEEP)
│
├── package.json              ← ROOT MONOLITH - deprecated once src/ removed
├── tsconfig.json             ← ROOT MONOLITH - deprecated once src/ removed
├── next.config.js            ← ROOT MONOLITH - deprecated once src/ removed
├── middleware.ts             ← ROOT MONOLITH - deprecated once src/ removed
├── tailwind.config.ts        ← ROOT MONOLITH - deprecated once src/ removed
├── postcss.config.mjs        ← ROOT MONOLITH - deprecated once src/ removed
├── next-env.d.ts             ← ROOT MONOLITH - deprecated once src/ removed
│
├── apps/                     ← NEW: Frontend applications
├── services/                 ← NEW: Backend services
├── backend/                  ← ORIGINAL monolith backend (deprecated)
├── src/                      ← ORIGINAL monolith frontend (do not delete yet)
├── scraper-ai/               ← Python scraping pipeline
├── data/                     ← JSON data files
├── database/                 ← Empty (migration artifacts)
├── deprecated/               ← Archived old code
├── docs/                     ← Documentation
├── portfolio/                ← Portfolio showcase docs
└── public/                   ← Static assets (boilerplate + logos)
```

---

## Module Structure

### apps/user-frontend/ (Reader App)

```
apps/user-frontend/
├── .env.example
├── Dockerfile
├── middleware.ts
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/                   ← 36 page directories (reader-facing only)
    ├── components/            ← 22 components (reader UI only)
    ├── config/                ← 4 files (api, categoryThemes, market-indices, site)
    ├── contexts/              ← 2 files (LogoContext, ThemeContext)
    ├── hooks/                 ← 5 hooks (useCategories, useMarketData, useSiteConfig, useSiteStats, useSubCategoryFilters)
    ├── lib/                   ← 12 files (client-side utilities)
    ├── styles/                ← 1 file (logo-animations.css)
    └── types/                 ← 2 files (api.ts, market.ts)
```

### apps/admin-frontend/ (Admin CMS)

```
apps/admin-frontend/
├── .env.example
├── Dockerfile
├── middleware.ts
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/                   ← 22 page directories (admin CMS only)
    ├── components/            ← 17 components (admin UI, editors, guards)
    ├── config/                ← 3 files (api, rbac, site)
    ├── contexts/              ← 3 files (AdminThemeContext, LogoContext, ThemeContext)
    ├── hooks/                 ← 3 hooks (useAdminAuth, useAdminToken, useSecureAuth)
    ├── lib/                   ← 15 files (admin client utilities, RBAC, auth)
    ├── styles/                ← 1 file (logo-animations.css)
    └── types/                 ← 2 files (api.ts, editorjs-tools.d.ts)
```

### services/user-backend/ (Reader API)

```
services/user-backend/
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts               ← Express app entry
    ├── config/                ← 3 files (database, redis, socket)
    ├── lib/                   ← 9 files (market data, auth, security, config)
    ├── middleware/             ← 3 files (auth, errorHandler, requestLogger)
    ├── routes/                ← 9 routes (articles, auth, categories, comments, health, market, stats, user-preferences, webstories)
    └── types/                 ← 1 file (auth.ts)
```

### services/admin-backend/ (Admin API)

```
services/admin-backend/
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts               ← Express app entry
    ├── config/                ← 3 files (database, redis, socket)
    ├── lib/                   ← 4 files (api-middleware, config, secure-auth, security)
    ├── middleware/             ← 2 files (auth, errorHandler)
    ├── routes/                ← 5 files (admin, articles, auth, categories, health)
    └── types/                 ← 1 file (auth.ts)
```

---

## src/app/ — Pages Audit

### Legend
- ✅ Correctly placed | ❌ REMOVED (was wrong) | ⬜ Correctly absent | 🔴 Needs attention

| # | Directory | Purpose | Classification | user-frontend | admin-frontend |
|---|-----------|---------|---------------|:---:|:---:|
| 1 | `about/` | About Us page | USER | ✅ | ⬜ |
| 2 | `admin/` | Full admin CMS (20+ subdirs) | ADMIN | ⬜ | ✅ decomposed to root |
| 3 | `advertise/` | Advertising inquiry form | USER | ✅ | ⬜ |
| 4 | `analysis/` | Analysis articles listing | USER | ✅ | ⬜ |
| 5 | `article/` | Single article view `[slug]` | USER | ✅ | ⬜ |
| 6 | `articles/` | Article listing page | USER | ✅ | ⬜ |
| 7 | `auth/` | Sign in/up, forgot password | USER | ✅ | ⬜ (has own `login/`) |
| 8 | `careers/` | Job listings | USER | ✅ | ⬜ |
| 9 | `category/` | Category landing pages | USER | ✅ | ⬜ |
| 10 | `contact/` | Contact form | USER | ✅ | ⬜ |
| 11 | `cookies/` | Cookie policy | USER | ✅ | ⬜ |
| 12 | `dashboard/` | User reading dashboard | USER | ✅ | ⬜ |
| 13 | `developers/` | API documentation | USER | ✅ | ⬜ |
| 14 | `help/` | FAQ/help center | USER | ✅ | ✅ (different content) |
| 15 | `interests/` | Topic selection | USER | ✅ | ⬜ |
| 16 | `login/` | Redirect → `/auth/signin` | USER | ✅ | ⬜ |
| 17 | `logo-history/` | Redirect → admin | ADMIN | ❌ removed | ✅ |
| 18 | `logo-manager/` | Logo management tool | ADMIN | ⬜ | ✅ |
| 19 | `logo-showcase/` | Redirect → admin | ADMIN | ❌ removed | ✅ |
| 20 | `news/` | News listing & detail | USER | ✅ | ⬜ |
| 21 | `notifications/` | User notification center | USER | ✅ | ⬜ |
| 22 | `opinion/` | Opinion articles | USER | ✅ | ⬜ |
| 23 | `press/` | Press releases | USER | ✅ | ⬜ |
| 24 | `privacy/` | Privacy policy | USER | ✅ | ⬜ |
| 25 | `profile/` | User profile | USER | ✅ | ⬜ |
| 26 | `register/` | Redirect → `/auth/signup` | USER | ✅ | ⬜ |
| 27 | `saved/` | Saved/bookmarked articles | USER | ✅ | ⬜ |
| 28 | `search/` | Search results | USER | ✅ | ⬜ |
| 29 | `services/` | Platform services showcase | USER | ✅ | ⬜ |
| 30 | `settings/` | User settings | USER | ✅ | ⬜ |
| 31 | `shorts/` | Short news summaries | USER | ✅ | ⬜ |
| 32 | `sitemap/` | HTML sitemap | USER | ✅ | ⬜ |
| 33 | `subscription/` | Subscription plans | USER | ✅ | ⬜ |
| 34 | `terms/` | Terms of service | USER | ✅ | ⬜ |
| 35 | `test-market-api/` | Dev redirect (dead) | OBSOLETE | ⬜ | ⬜ |
| 36 | `trending/` | Trending stories | USER | ✅ | ⬜ |
| 37 | `web-stories/` | Web stories | USER | ✅ | ⬜ |

---

## src/app/api/ — API Routes Audit

### These are Next.js API routes in the monolith. In the new architecture, backends handle all API logic.

| # | Route | Purpose | Classification | user-backend | admin-backend |
|---|-------|---------|---------------|:---:|:---:|
| 1 | `admin/auth/login/` | Simple admin login (env-var) | OBSOLETE | ⬜ | superseded |
| 2 | `admin/login/` | Admin login (RBAC + rate limit) | ADMIN | ⬜ | ✅ auth.ts |
| 3 | `admin/simple-auth/` | Unified admin auth | ADMIN | ⬜ | ✅ auth.ts |
| 4 | `admin/stats/` | Dashboard stats proxy | ADMIN | ⬜ | 🔴 no stats route |
| 5 | `admin/market-config/` | Market config CRUD (9 routes) | ADMIN | ⬜ | 🔴 no market-config routes |
| 6 | `articles/route.ts` | Returns 404 stub | OBSOLETE | ✅ | ✅ |
| 7 | `articles/[id]/route.ts` | Returns 404 stub | OBSOLETE | ✅ | ✅ |
| 8 | `articles/[id]/restore/` | Restore soft-deleted article | ADMIN | ⬜ | 🔴 may need adding |
| 9 | `articles/trash/` | List trashed articles | ADMIN | ⬜ | 🔴 may need adding |
| 10 | `auth/login/` | Login via UnifiedAdminAuth | BOTH | ✅ | ✅ |
| 11 | `auth/register/` | User registration proxy | USER | ✅ | ⬜ |
| 12 | `auth/logout/` | Session destroy | BOTH | ✅ | ✅ |
| 13 | `auth/me/` | Current user profile | BOTH | ✅ | ✅ |
| 14 | `auth/verify/` | Token + CSRF verification | BOTH | ✅ | ✅ |
| 15 | `auth/change-password/` | Change password | USER | ✅ | ⬜ |
| 16 | `categories/` | List + Create | BOTH | ✅ | ✅ |
| 17 | `categories/[id]/` | Update + Delete | ADMIN | ⬜ | ✅ |
| 18 | `categories/[id]/restore/` | Restore category | ADMIN | ⬜ | 🔴 may need adding |
| 19 | `categories/trash/` | List trashed categories | ADMIN | ⬜ | 🔴 may need adding |
| 20 | `market/live/` | Live market data (691 lines) | USER | ✅ market.ts | ⬜ |
| 21 | `market/crypto/` | Cached crypto data | USER | ✅ | ⬜ |
| 22 | `market/commodities/` | Cached commodities | USER | ✅ | ⬜ |
| 23 | `market/currencies/` | Cached currency rates | USER | ✅ | ⬜ |
| 24 | `market/indices/` | Fetch indices | USER | ✅ | ⬜ |
| 25 | `market/country/[country]/` | Country market dashboard | USER | ✅ | ⬜ |
| 26 | `market/health/` | Market health check | USER | ✅ | ⬜ |
| 27 | `market/update/` | Trigger market refresh | ADMIN | ⬜ | 🔴 missing |
| 28 | `market/ingest/` | Ingest market data to DB | ADMIN | ⬜ | 🔴 missing |
| 29 | `market/auto-update/` | Start/stop auto-update | ADMIN | ⬜ | 🔴 missing |
| 30 | `market/providers/` | Manage provider prefs | ADMIN | ⬜ | 🔴 missing |
| 31 | `market/test-connectivity/` | Test API connectivity | ADMIN | ⬜ | 🔴 missing |
| 32 | `market/debug/` | Debug endpoint | OBSOLETE | ⬜ | ⬜ |
| 33 | `placeholder/[...dims]/` | SVG placeholder generator | UTILITY | ⬜ | ⬜ |
| 34 | `upload/images/` | Admin image upload | ADMIN | ⬜ | 🔴 missing |

### Gaps in admin-backend routes (to be added from admin.ts 2366-line file):
- Market config CRUD (9 subroutes)
- Market admin operations (update, ingest, auto-update, providers, test-connectivity)
- Stats route
- Article trash/restore
- Category trash/restore
- Image upload

---

## src/lib/ — Library Files Audit

### Legend
- **C** = Client-side | **S** = Server-side
- ✅ Correctly present | ❌ REMOVED (wrong place) | ⬜ Correctly absent | 🔴 Now fixed

| # | File | C/S | Belongs To | user-frontend | admin-frontend | user-backend | admin-backend |
|---|------|:---:|-----------|:---:|:---:|:---:|:---:|
| 1 | `admin-client.ts` | C | ADMIN-FE | ⬜ | ✅ | ⬜ | ⬜ |
| 2 | `admin-jwt-bridge.ts` | C | OBSOLETE | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | `api/index.ts` | C | ADMIN-FE | ❌ removed | ✅ | ⬜ | ⬜ |
| 4 | `api-client.ts` | C | ADMIN-FE | ❌ removed | ✅ | ⬜ | ⬜ |
| 5 | `api-middleware.ts` | S | ADMIN-BE | ⬜ | ⬜ | ⬜ | ✅ |
| 6 | `api.ts` | C | ADMIN-FE | ❌ removed | ✅ | ⬜ | ⬜ |
| 7 | `audit-logger.ts` | C | ADMIN-FE | ⬜ | ✅ (added) | ⬜ | ❌ removed |
| 8 | `auth.ts` | C | USER-FE | ✅ | ❌ removed | ⬜ | ⬜ |
| 9 | `categoryUtils.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |
| 10 | `config.ts` | S | BOTH-BE | ⬜ | ⬜ | ✅ | ✅ |
| 11 | `contentUtils.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |
| 12 | `database-mock.ts` | M | OBSOLETE | ⬜ | ⬜ | ⬜ | ⬜ |
| 13 | `database-real.ts` | C | USER-FE | ✅ (cleaned) | ⬜ | ⬜ | ⬜ |
| 14 | `database.ts` | S | OBSOLETE | ⬜ | ⬜ | ⬜ | ⬜ |
| 15 | `error-handler.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |
| 16 | `get-admin-token.ts` | C | ADMIN-FE | ⬜ | ✅ | ⬜ | ⬜ |
| 17 | `location-service.ts` | C | USER-FE | ✅ | ⬜ | ⬜ | ⬜ |
| 18 | `market-auto-update.ts` | S | USER-BE | ⬜ | ⬜ | ✅ | ⬜ |
| 19 | `market-cache.ts` | C | USER-FE | ✅ | ⬜ | ⬜ | ⬜ |
| 20 | `market-config.ts` | C | USER-FE + USER-BE | ✅ | ⬜ | ✅ (added) | ⬜ |
| 21 | `market-data-service.ts` | C | USER-FE | ✅ | ⬜ | ⬜ | ⬜ |
| 22 | `provider-preferences.ts` | S | USER-BE | ⬜ | ⬜ | ✅ | ⬜ |
| 23 | `rbac-auth.ts` | C | ADMIN-FE | ⬜ | ✅ | ⬜ | ⬜ |
| 24 | `real-market-data.ts` | S | USER-BE | ⬜ | ⬜ | ✅ | ⬜ |
| 25 | `scalable-config.ts` | S | OBSOLETE | ⬜ | ⬜ | ⬜ | ⬜ |
| 26 | `secure-auth.ts` | S | BOTH-BE | ⬜ | ⬜ | ✅ | ✅ |
| 27 | `security.ts` | S | BOTH-BE | ⬜ | ⬜ | ✅ | ✅ |
| 28 | `simple-admin-auth.ts` | C | OBSOLETE | ⬜ | ⬜ | ⬜ | ⬜ |
| 29 | `site-config-cache.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |
| 30 | `toast.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |
| 31 | `tradingview-fallback.ts` | S | USER-BE | ⬜ | ⬜ | ✅ | ⬜ |
| 32 | `tradingview-runner.ts` | S | USER-BE | ⬜ | ⬜ | ✅ | ⬜ |
| 33 | `unified-admin-auth.ts` | M | ADMIN-FE | ⬜ | ✅ | ⬜ | ⬜ |
| 34 | `utils.ts` | C | BOTH-FE | ✅ | ✅ | ⬜ | ⬜ |

### Obsolete files (in root monolith only, not copied anywhere — safe to delete later):
- `admin-jwt-bridge.ts` — superseded by `rbac-auth.ts`
- `database-mock.ts` — Supabase mock from v1
- `database.ts` — Supabase direct-access from v1
- `scalable-config.ts` — near-duplicate of `config.ts`
- `simple-admin-auth.ts` — legacy wrapper, superseded by `rbac-auth.ts`

---

## src/components/ — Components Audit

| # | Component | Classification | user-frontend | admin-frontend |
|---|-----------|---------------|:---:|:---:|
| 1 | `AdminLayoutContent.tsx` | ADMIN | ❌ removed | ✅ |
| 2 | `AdminProtected.tsx` | DEAD FILE | ❌ removed | ⬜ |
| 3 | `AdSlot.tsx` | USER | ✅ | ❌ removed |
| 4 | `AdvancedNewsEditor.tsx` | ADMIN | ❌ removed | ✅ |
| 5 | `ArticleCard.tsx` | USER | ✅ | ⬜ |
| 6 | `ArticlePreview.tsx` | ADMIN | ❌ removed | ✅ (added) |
| 7 | `BeautifulEditor.tsx` | ADMIN | ❌ removed | ✅ |
| 8 | `Breadcrumb.tsx` | BOTH | ✅ | ✅ |
| 9 | `CategoryFilters.tsx` | USER | ✅ | ⬜ |
| 10 | `CommentSection.tsx` | USER | ✅ | ⬜ |
| 11 | `ConditionalLayout.tsx` | USER | ✅ | ⬜ |
| 12 | `ContactInfo.tsx` | USER | ✅ | ⬜ |
| 13 | `DivergenceMark.tsx` | BOTH | ✅ | ✅ (added) |
| 14 | `FollowButton.tsx` | USER | ✅ | ⬜ |
| 15 | `Footer.tsx` | USER | ✅ | ⬜ |
| 16 | `Header.tsx` | USER | ✅ | ⬜ |
| 17 | `LazyLogoManager.tsx` | ADMIN | ❌ removed | ✅ (added) |
| 18 | `Loading.tsx` | BOTH | ✅ | ✅ |
| 19 | `LogoGallery.tsx` | ADMIN | ❌ removed | ✅ (added) |
| 20 | `LogoHistory.tsx` | ADMIN | ❌ removed | ✅ (added) |
| 21 | `LogoManager.tsx` | ADMIN | ❌ removed | ✅ |
| 22 | `MarketWidget.tsx` | USER | ✅ | ⬜ |
| 23 | `NewsCard.tsx` | USER | ✅ | ⬜ |
| 24 | `Newsletter.tsx` | USER | ✅ | ⬜ |
| 25 | `PerformanceMonitor.tsx` | BOTH | ✅ | ✅ |
| 26 | `QuickNav.tsx` | USER | ✅ | ⬜ |
| 27 | `SaveButton.tsx` | USER | ✅ | ⬜ |
| 28 | `SecureAdminGuard.tsx` | DEAD FILE | ❌ removed | ⬜ |
| 29 | `SecureLoginForm.tsx` | ADMIN | ❌ removed | ✅ |
| 30 | `ShareButton.tsx` | USER | ✅ | ⬜ |
| 31 | `SimpleAdminGuard.tsx` | DEAD FILE | ❌ removed | ⬜ |
| 32 | `SortControl.tsx` | USER (empty) | ✅ | ⬜ |
| 33 | `ThemeToggle.tsx` | BOTH | ✅ | ✅ |
| 34 | `UnifiedAdminGuard.tsx` | ADMIN | ❌ removed | ✅ (added) |
| 35 | `admin/RoleBasedDashboard.tsx` | ADMIN | ❌ removed | ✅ |
| 36 | `admin/RouteGuard.tsx` | ADMIN | ❌ removed | ✅ |
| 37 | `rbac/index.tsx` | ADMIN | ❌ removed | ✅ |
| 38 | `icons/EditorialIcons.tsx` | BOTH | ✅ | ✅ |

---

## src/hooks/ — Hooks Audit

| # | Hook | Classification | user-frontend | admin-frontend |
|---|------|---------------|:---:|:---:|
| 1 | `useAdminAuth.ts` | ADMIN | ❌ removed | ✅ |
| 2 | `useAdminToken.ts` | ADMIN | ❌ removed | ✅ |
| 3 | `useCategories.ts` | USER | ✅ | ⬜ |
| 4 | `useMarketData.ts` | USER | ✅ | ⬜ |
| 5 | `useSecureAuth.ts` | ADMIN | ❌ removed | ✅ (added) |
| 6 | `useSiteConfig.ts` | USER | ✅ | ⬜ |
| 7 | `useSiteStats.ts` | USER | ✅ | ⬜ |
| 8 | `useSubCategoryFilters.ts` | USER | ✅ | ⬜ |

---

## src/contexts/ — Contexts Audit

| # | Context | Classification | user-frontend | admin-frontend |
|---|---------|---------------|:---:|:---:|
| 1 | `AdminThemeContext.tsx` | ADMIN (empty) | ❌ removed | ✅ |
| 2 | `LogoContext.tsx` | BOTH | ✅ | ✅ |
| 3 | `ThemeContext.tsx` | BOTH | ✅ | ✅ |

---

## src/config/ — Config Audit

| # | File | Classification | user-frontend | admin-frontend |
|---|------|---------------|:---:|:---:|
| 1 | `api.ts` | BOTH | ✅ | ✅ |
| 2 | `categoryThemes.ts` | USER | ✅ | ⬜ |
| 3 | `market-indices.ts` | USER | ✅ | ⬜ |
| 4 | `rbac.ts` | ADMIN | ❌ removed | ✅ |
| 5 | `site.ts` | USER + ADMIN | ✅ | ✅ (added) |

---

## src/types/ — Types Audit

| # | File | Classification | user-frontend | admin-frontend |
|---|------|---------------|:---:|:---:|
| 1 | `api.ts` | BOTH | ✅ | ✅ |
| 2 | `editorjs-tools.d.ts` | ADMIN | ❌ removed | ✅ |
| 3 | `market.ts` | USER | ✅ | ❌ removed |

---

## src/styles/ — Styles Audit

| # | File | Classification | user-frontend | admin-frontend |
|---|------|---------------|:---:|:---:|
| 1 | `logo-animations.css` | BOTH | ✅ | ✅ |

---

## backend/ — Original Monolith Backend

**Status**: DEPRECATED — routes migrated to `services/user-backend/` and `services/admin-backend/`

### backend/src/routes/

| Route File | Lines | Migrated To |
|-----------|-------|-------------|
| `articles.ts` | 1266 | `user-backend/src/routes/articles.ts` + `admin-backend/src/routes/articles.ts` |
| `auth.ts` | 510 | `user-backend/src/routes/auth.ts` + `admin-backend/src/routes/auth.ts` |
| `categories.ts` | 452 | `user-backend/src/routes/categories.ts` + `admin-backend/src/routes/categories.ts` |
| `comments.ts` | — | `user-backend/src/routes/comments.ts` |
| `health.ts` | — | `user-backend/src/routes/health.ts` + `admin-backend/src/routes/health.ts` |
| `market.ts` | 571 | `user-backend/src/routes/market.ts` |
| `stats.ts` | — | `user-backend/src/routes/stats.ts` |
| `user-preferences.ts` | — | `user-backend/src/routes/user-preferences.ts` |
| `webstories.ts` | 636 | `user-backend/src/routes/webstories.ts` |
| `admin.ts` | 2366 | `admin-backend/src/routes/admin.ts` (needs splitting into ~15 files) |

### backend/prisma/

Shared by both service backends. `services/user-backend/prisma/schema.prisma` and `services/admin-backend/prisma/schema.prisma` should reference the same schema.

---

## Other Root Directories

### data/

| File | Status | Action |
|------|--------|--------|
| `admin-users.json` | Contains password hashes | ⚠️ Security risk — convert to seed script in `admin-backend/prisma/seed.ts` |
| `tradingview_indices.json` | Generated by scraper | Move to `scraper-ai/data/` |

### database/

Empty directory (migration artifact). Can be deleted.

### deprecated/

Archived old code. Not needed in new architecture. Keep for reference only.

### scraper-ai/

Python AI scraping pipeline. Standalone service in `docker-compose.yml`.

⚠️ **Missing `scraper-ai/Dockerfile`** — docker-compose references `build: ./scraper-ai` but no Dockerfile exists.

### public/

| Asset | Status |
|-------|--------|
| `logo.png`, `logo.svg` | ✅ Copied to both `apps/*/public/` |
| `favicon.ico` | In `src/app/` — ✅ Copied to admin-frontend |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Next.js boilerplate — delete |
| `uploads/images/` | Empty dir — upload handling should be in admin-backend |

### portfolio/

Portfolio showcase documentation. Stays at root. Not part of application code.

### docs/

Project documentation. Stays at root.

---

## Root Config Files

| File | Status | Notes |
|------|--------|-------|
| `docker-compose.yml` | **KEEP** | Orchestrates all 7 services |
| `.env.example` | **KEEP** | Master env template |
| `.gitignore` | **KEEP** | Covers entire repo |
| `eslint.config.mjs` | **KEEP** | Shared workspace lint |
| `README.md` | **KEEP** | Project readme |
| `CONTRIBUTING.md` | **KEEP** | Contribution guide |
| `package.json` | Deprecated | Root monolith deps — remove when `src/` deleted |
| `tsconfig.json` | Deprecated | Root monolith config — remove when `src/` deleted |
| `next.config.js` | Deprecated | Root monolith config — remove when `src/` deleted |
| `middleware.ts` | Deprecated | Root monolith middleware — remove when `src/` deleted |
| `tailwind.config.ts` | Deprecated | Root monolith config — remove when `src/` deleted |
| `postcss.config.mjs` | Deprecated | Root monolith config — remove when `src/` deleted |
| `next-env.d.ts` | Deprecated | Auto-generated — remove when `src/` deleted |
| `tsconfig.tsbuildinfo` | Deprecated | Build cache — remove when `src/` deleted |

---

## Actions Taken

### Files Added (Missing from Modules)

| File | Added To | Reason |
|------|----------|--------|
| `ArticlePreview.tsx` | admin-frontend/components/ | Admin needs article preview |
| `LazyLogoManager.tsx` | admin-frontend/components/ | Admin logo management |
| `LogoGallery.tsx` | admin-frontend/components/ | Admin logo gallery |
| `LogoHistory.tsx` | admin-frontend/components/ | Admin logo history |
| `UnifiedAdminGuard.tsx` | admin-frontend/components/ | Admin route protection |
| `DivergenceMark.tsx` | admin-frontend/components/ | Brand mark used by Loading.tsx |
| `useSecureAuth.ts` | admin-frontend/hooks/ | SecureLoginForm dependency |
| `audit-logger.ts` | admin-frontend/lib/ | Client-side audit logging |
| `site.ts` | admin-frontend/config/ | Site name/contact info |
| `market-config.ts` | user-backend/lib/ | Required by market-auto-update.ts |
| `logo.svg` | Both apps/*/public/ | Brand asset |
| `logo.png` | Both apps/*/public/ | Brand asset (binary copied) |
| `favicon.ico` | admin-frontend/app/ | Favicon (binary copied) |

### Files Removed (Wrong Placement)

**From user-frontend** (19 admin files that readers don't need):
- Components: AdminLayoutContent, AdminProtected, AdvancedNewsEditor, ArticlePreview, BeautifulEditor, LazyLogoManager, LogoGallery, LogoHistory, LogoManager, SecureAdminGuard, SecureLoginForm, SimpleAdminGuard, UnifiedAdminGuard, admin/RoleBasedDashboard, admin/RouteGuard, rbac/index
- Hooks: useAdminAuth, useAdminToken, useSecureAuth
- Contexts: AdminThemeContext
- Config: rbac.ts
- Lib: api-client.ts, api.ts, api/ directory
- Types: editorjs-tools.d.ts
- Pages: logo-history/, logo-showcase/

**From admin-frontend** (3 user files that admin doesn't need):
- Components: AdSlot.tsx
- Lib: auth.ts (user registration/login — admin has rbac-auth/unified-admin-auth)
- Types: market.ts

**From admin-backend** (1 wrongly placed):
- Lib: audit-logger.ts (client-side code using localStorage)

---

## Remaining Work

### Priority 1: Adapt Copied Files
All files were copied as-is. Imports need updating:
- `@/lib/...` → correct paths for each module
- `NEXT_PUBLIC_API_URL` → service-specific URLs
- Remove cross-module dependencies

### Priority 2: Split admin.ts (2366 lines)
`services/admin-backend/src/routes/admin.ts` needs splitting into individual route files:
- market-config.ts (CRUD for indices, commodities, cryptos, currencies)
- market-admin.ts (update, ingest, auto-update, providers, test-connectivity)
- stats.ts (dashboard statistics)
- upload.ts (image upload)
- site-config.ts
- users.ts
- newsletter.ts
- system.ts

### Priority 3: Add Missing Admin Backend Routes
From API routes audit, these are missing from admin-backend:
- Market config CRUD (9 subroutes)
- Market admin operations (5 routes)
- Article trash/restore
- Category trash/restore
- Image upload
- Stats aggregation

### Priority 4: Header.tsx Dependency Fix
`apps/user-frontend/src/components/Header.tsx` imports `useAdminAuth` to show an "Admin Panel" link. This was removed. Need to replace with simple localStorage check or remove admin link from public header.

### Priority 5: Rewrite Backend Lib Files
- `api-middleware.ts` — uses Next.js `NextRequest`/`NextResponse`, needs Express `(req, res, next)`
- `market-auto-update.ts` — wire into Express server startup

### Priority 6: Create Scraper Dockerfile
`docker-compose.yml` references `build: ./scraper-ai` but no Dockerfile exists.

### Priority 7: Clean Up
- Delete empty `database/` directory  
- Delete boilerplate SVGs from `public/`
- Convert `data/admin-users.json` to proper seed script

---

## Dependency Leak Warnings

| Component | Issue | Impact |
|-----------|-------|--------|
| `Header.tsx` (user-frontend) | Was importing `useAdminAuth` | Removed hook — needs simpler admin link logic |
| `contentUtils.ts` | Imports `Article` type from `database-real` | Works but should use shared types |
| `error-handler.ts` (user-frontend) | Imports `Permission` from `@/config/rbac` | RBAC config removed — strip RBAC methods from user copy |
| `database-real.ts` (root) | Imports from `scalable-config` | Stale import — obsolete file |
| `ConditionalLayout.tsx` (user-frontend) | Checks for admin routes | Irrelevant in split — admin is separate app |
