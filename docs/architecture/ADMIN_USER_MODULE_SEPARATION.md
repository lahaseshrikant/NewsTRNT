# Admin & User Module Separation — Architecture RFC

> **Status:** Draft  
> **Author:** Engineering  
> **Date:** 2026-02-11  
> **Branch:** `feat/module-separation` (to be created)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Proposed Architecture](#3-proposed-architecture)
4. [Separation Strategy](#4-separation-strategy)
5. [Migration Plan](#5-migration-plan)
6. [Directory Structure](#6-directory-structure)
7. [Shared Module Contract](#7-shared-module-contract)
8. [Authentication Consolidation](#8-authentication-consolidation)
9. [API Route Separation](#9-api-route-separation)
10. [Backend Refactoring](#10-backend-refactoring)
11. [Build & Deployment Changes](#11-build--deployment-changes)
12. [Risk Assessment](#12-risk-assessment)
13. [Implementation Phases](#13-implementation-phases)
14. [Success Criteria](#14-success-criteria)

---

## 1. Executive Summary

### The Problem

The NewsTRNT platform currently runs as a **single monolithic Next.js application** where admin CMS and public reader-facing code are deeply intertwined. This causes:

- **Bundle bloat**: Admin-only dependencies (TipTap editors, RBAC, audit logging) ship in the public bundle — adding ~180KB+ gzipped to pages readers never use.
- **Security surface**: Admin auth logic, route guards, and API endpoint definitions live alongside public code. A vulnerability in the admin auth path affects the consumer app and vice versa.
- **Deployment coupling**: Shipping a typo fix to the homepage requires rebuilding the entire admin CMS. Admin feature work blocks reader-experience releases.
- **Developer friction**: 55+ admin pages, 35+ public pages, 6 auth modules, 4 guard components, and 2 separate auth paradigms all coexist in one `src/` tree. Onboarding developers waste time navigating ambiguous ownership.
- **Auth fragmentation**: Admin uses client-side session storage with env-variable credentials and a fake JWT bridge; users use real server-signed JWTs. The backend middleware handles both in a single fragile `if/else` chain.

### The Proposal

Separate admin and user-facing code into **distinct logical modules** within the same monorepo, sharing only an explicit contract of types, utilities, and design tokens. This can be achieved **without** splitting into two separate Next.js apps — leveraging Next.js route groups, explicit module boundaries, and build-time code splitting.

### Why Not Two Separate Apps?

| Approach | Pros | Cons |
|----------|------|------|
| **Two Next.js apps** (monorepo workspaces) | True physical isolation, independent deploys | Duplicate setup (configs, CI, Docker), harder to share components, two dev servers, operational complexity |
| **Route groups + module boundaries** (recommended) | Single deploy, shared infra, easier DX, incremental migration | Requires discipline for boundary enforcement, still one build |
| **Micro-frontends** | Maximum isolation | Massive complexity, not justified at current scale |

**Recommendation: Route groups + module boundaries** — this gives us 80% of the isolation benefit with 20% of the migration cost. If the platform later requires independent scaling (e.g., admin gets 1/10th the traffic), we can promote the route groups into separate apps with minimal restructuring.

---

## 2. Current State Analysis

### 2.1 Code Distribution

| Domain | Pages | Components | Hooks | Lib Modules | Config Files |
|--------|-------|------------|-------|-------------|--------------|
| Admin | ~55 | 13 | 3 | 9 | 2 |
| User/Public | ~35 | 12 | 3 | 15 | 2 |
| Shared | — | 11 | 2 | 6 | 1 |
| **Total** | **~90** | **36** | **8** | **30** | **5** |

### 2.2 Authentication Architecture — Current

```
┌─────────────────────────────────────────────────────┐
│                   ADMIN AUTH                        │
│                                                     │
│  UnifiedAdminAuth → localStorage session            │
│  AdminJWTBridge → base64 fake token                 │
│  4 guard components (UnifiedAdminGuard,             │
│    SecureAdminGuard, SimpleAdminGuard,              │
│    AdminProtected)                                  │
│  Credentials from ENV vars (not DB)                 │
│  + RBAC roles from rbac.ts config                   │
├─────────────────────────────────────────────────────┤
│                   USER AUTH                         │
│                                                     │
│  AuthService class → /api/auth/login                │
│  Real JWT (jsonwebtoken, 7-day expiry)              │
│  Token: newsnerve_auth_token in localStorage        │
│  Server-side jwt.verify()                           │
├─────────────────────────────────────────────────────┤
│              BACKEND MIDDLEWARE                      │
│                                                     │
│  Single authenticateToken() function                │
│  Checks if token has 3 dots → JWT path              │
│  Else → base64 decode → RBAC path                   │
│  Fragile coupling point                             │
└─────────────────────────────────────────────────────┘
```

### 2.3 Key Coupling Points

1. **`backend/src/routes/admin.ts`** — 2,366-line monolith handling all admin backend operations
2. **`backend/src/middleware/auth.ts`** — single function handling both admin/user token formats
3. **`src/config/api.ts`** — mixed admin and user endpoint definitions
4. **`src/lib/` directory** — 9 admin-only modules sit alongside 15 user/shared modules with no namespace separation
5. **`src/components/`** — admin guards, editors, and RBAC components mixed with Header, Footer, ArticleCard
6. **Logo pages** duplicated: `/logo-manager`, `/logo-history` exist at root AND under `/admin/`
7. **Token key `token`** in localStorage used by both admin and user code

---

## 3. Proposed Architecture

### 3.1 High-Level Module Diagram

```
news-platform/
│
├── src/
│   ├── modules/
│   │   ├── admin/              ← Admin module (isolated)
│   │   │   ├── components/     ← AdminLayoutContent, guards, editors
│   │   │   ├── hooks/          ← useAdminAuth, useAdminToken, useSecureAuth
│   │   │   ├── lib/            ← unified-admin-auth, admin-client, rbac-auth, audit-logger
│   │   │   ├── config/         ← rbac.ts, admin API endpoints
│   │   │   └── types/          ← admin-specific types
│   │   │
│   │   ├── reader/             ← Reader/public module (isolated)
│   │   │   ├── components/     ← ArticleCard, NewsCard, CategoryFilters, SaveButton, etc.
│   │   │   ├── hooks/          ← useCategories, useSubCategoryFilters
│   │   │   ├── lib/            ← auth.ts (user auth), categoryUtils
│   │   │   ├── config/         ← categoryThemes, reader API endpoints
│   │   │   └── types/          ← reader-specific types
│   │   │
│   │   └── shared/             ← Shared contract (both modules depend on this)
│   │       ├── components/     ← DivergenceMark, Breadcrumb, Loading, ThemeToggle
│   │       ├── hooks/          ← useMarketData, useSiteConfig, useSiteStats
│   │       ├── lib/            ← api-client, utils, database, error-handler, market-*
│   │       ├── config/         ← site.ts, market-indices
│   │       ├── types/          ← api.ts, market.ts (shared type contracts)
│   │       └── styles/         ← globals.css, design tokens
│   │
│   ├── app/
│   │   ├── (reader)/           ← Route group for public pages
│   │   │   ├── layout.tsx      ← Reader layout (Header + Footer)
│   │   │   ├── page.tsx        ← Homepage
│   │   │   ├── category/
│   │   │   ├── article/
│   │   │   ├── news/
│   │   │   ├── trending/
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── ... (all public pages)
│   │   │
│   │   ├── (admin)/            ← Route group for admin pages
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx  ← Admin layout (sidebar + guard)
│   │   │   │   ├── page.tsx    ← Dashboard
│   │   │   │   ├── content/
│   │   │   │   ├── analytics/
│   │   │   │   ├── users/
│   │   │   │   └── ... (all admin pages)
│   │   │   └── admin-login/    ← Separate admin login (outside guard)
│   │   │
│   │   ├── api/
│   │   │   ├── admin/          ← Admin API routes
│   │   │   ├── auth/           ← User auth routes
│   │   │   ├── articles/       ← Public article routes
│   │   │   └── ...
│   │   │
│   │   ├── layout.tsx          ← Root layout (providers only)
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   └── contexts/               ← Move to shared/
│
├── backend/
│   └── src/
│       └── routes/
│           ├── admin/          ← Split admin.ts into sub-modules
│           │   ├── index.ts
│           │   ├── users.ts
│           │   ├── content.ts
│           │   ├── analytics.ts
│           │   ├── system.ts
│           │   └── market-config.ts
│           ├── auth.ts
│           ├── articles.ts
│           └── ...
│
└── docker-compose.yml
```

### 3.2 Module Dependency Rules

```
                    ┌──────────┐
                    │  shared   │
                    └────▲─▲───┘
                         │ │
              ┌──────────┘ └──────────┐
              │                       │
        ┌─────┴─────┐          ┌─────┴─────┐
        │   admin    │          │  reader    │
        └───────────┘          └───────────┘

  ✅ admin    → imports from shared
  ✅ reader   → imports from shared
  ❌ admin    → NEVER imports from reader
  ❌ reader   → NEVER imports from admin
  ❌ shared   → NEVER imports from admin or reader
```

These rules will be enforced via:
- **ESLint `no-restricted-imports`** rules
- **TypeScript path aliases** (`@admin/*`, `@reader/*`, `@shared/*`)
- **Code review policy**

---

## 4. Separation Strategy

### 4.1 Classification Rules

Every file in `src/` will be classified into one of three buckets:

| If the file... | Module |
|----------------|--------|
| Is only used by admin pages or admin components | `admin` |
| Is only used by public/reader pages or reader components | `reader` |
| Is used by both, OR is infrastructure (themes, utils, DB) | `shared` |
| Unclear — used by admin but *could* be useful to reader | `shared` (promote) |

### 4.2 Component Classification

#### → `modules/admin/components/`
- `AdminLayoutContent.tsx`
- `UnifiedAdminGuard.tsx` (keep as primary)
- `AdminProtected.tsx` → **DELETE** (deprecated, replaced by UnifiedAdminGuard)
- `SecureAdminGuard.tsx` → **DELETE** (unused)
- `SimpleAdminGuard.tsx` → **DELETE** (unused)
- `SecureLoginForm.tsx`
- `AdvancedNewsEditor.tsx`
- `BeautifulEditor.tsx`
- `PerformanceMonitor.tsx`
- `admin/RoleBasedDashboard.tsx`
- `admin/RouteGuard.tsx`
- `rbac/index.tsx`
- `AdSlot.tsx` (admin-managed ad placements)

#### → `modules/reader/components/`
- `Header.tsx`
- `Footer.tsx`
- `ArticleCard.tsx`
- `NewsCard.tsx`
- `ArticlePreview.tsx`
- `CategoryFilters.tsx`
- `CommentSection.tsx`
- `Newsletter.tsx`
- `MarketWidget.tsx`
- `SaveButton.tsx`
- `ShareButton.tsx`
- `FollowButton.tsx`
- `QuickNav.tsx`
- `SortControl.tsx`

#### → `modules/shared/components/`
- `DivergenceMark.tsx`
- `Breadcrumb.tsx`
- `ConditionalLayout.tsx` → **REFACTOR** (should not exist once layouts are separated)
- `ContactInfo.tsx`
- `Loading.tsx`
- `ThemeToggle.tsx`
- `LogoManager.tsx` → **MOVE to admin** (management is admin-only)
- `LogoGallery.tsx` → Keep shared (display-only)
- `LogoHistory.tsx` → Keep shared
- `icons/EditorialIcons.tsx`

### 4.3 Hooks Classification

#### → `modules/admin/hooks/`
- `useAdminAuth.ts`
- `useAdminToken.ts`
- `useSecureAuth.ts`

#### → `modules/reader/hooks/`
- `useCategories.ts`
- `useSubCategoryFilters.ts`

#### → `modules/shared/hooks/`
- `useMarketData.ts`
- `useSiteConfig.ts`
- `useSiteStats.ts`

### 4.4 Lib Classification

#### → `modules/admin/lib/`
- `admin-client.ts`
- `admin-jwt-bridge.ts` → **DELETE** after auth consolidation
- `unified-admin-auth.ts`
- `simple-admin-auth.ts` → **DELETE** (legacy wrapper)
- `rbac-auth.ts`
- `secure-auth.ts`
- `get-admin-token.ts`
- `audit-logger.ts`
- `security.ts`

#### → `modules/reader/lib/`
- `auth.ts` (user AuthService)
- `categoryUtils.ts`
- `contentUtils.ts`

#### → `modules/shared/lib/`
- `api-client.ts`
- `api.ts`
- `api-middleware.ts`
- `api/index.ts`
- `utils.ts`
- `config.ts`
- `database.ts`, `database-mock.ts`, `database-real.ts`
- `error-handler.ts`
- `toast.ts`
- `location-service.ts`
- All `market-*.ts`, `tradingview-*.ts`, `real-market-data.ts`
- `scalable-config.ts`
- `site-config-cache.ts`
- `provider-preferences.ts`

---

## 5. Migration Plan

### Strategy: Incremental, Non-Breaking

Migrate bottom-up: **shared → admin → reader → route groups → cleanup**. At every step, the app should build and work. No big-bang rewrites.

### Step 1: Create Module Skeleton + Path Aliases

```
src/modules/admin/
src/modules/reader/
src/modules/shared/
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@admin/*": ["./src/modules/admin/*"],
      "@reader/*": ["./src/modules/reader/*"],
      "@shared/*": ["./src/modules/shared/*"]
    }
  }
}
```

### Step 2: Move Shared Module First

Move files with zero admin/reader dependencies first:
- `DivergenceMark`, `Breadcrumb`, `Loading`, `ThemeToggle`, `ContactInfo`
- `useMarketData`, `useSiteConfig`, `useSiteStats`
- `utils.ts`, `api-client.ts`, `database.ts`, `error-handler.ts`
- `site.ts`, `market-indices.ts`
- `api.ts`, `market.ts` (types)

Update all import paths. Use find-and-replace tooling.

### Step 3: Move Admin Module

Move admin-specific files:
- All admin components, hooks, lib, config
- Update `src/app/admin/**` pages to import from `@admin/*`

### Step 4: Move Reader Module

Move reader-specific files:
- All reader components, hooks, lib
- Update all public pages to import from `@reader/*`

### Step 5: Wrap Pages in Route Groups

Wrap existing pages in `(reader)` and `(admin)` route groups.

**Critical**: `(reader)` and `(admin)` are *route groups* — they don't affect the URL path. `/category/world` stays `/category/world`, not `/(reader)/category/world`.

```
src/app/(reader)/page.tsx           → URL: /
src/app/(reader)/category/world/    → URL: /category/world
src/app/(admin)/admin/page.tsx      → URL: /admin
```

Create separate layouts:
- `src/app/(reader)/layout.tsx` — wraps with Header + Footer
- `src/app/(admin)/admin/layout.tsx` — wraps with AdminSidebar + UnifiedAdminGuard

### Step 6: ESLint Boundary Enforcement

```js
// eslint.config.mjs — add module boundary rules
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@admin/*'], message: 'Reader module cannot import from admin module.' },
      ]
    }]
  },
  files: ['src/modules/reader/**/*'],
},
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@reader/*'], message: 'Admin module cannot import from reader module.' },
      ]
    }]
  },
  files: ['src/modules/admin/**/*'],
},
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@admin/*', '@reader/*'], message: 'Shared module cannot import from admin or reader.' },
      ]
    }]
  },
  files: ['src/modules/shared/**/*'],
}
```

### Step 7: Dead Code Cleanup

- Delete `SimpleAdminGuard.tsx` (unused legacy)
- Delete `SecureAdminGuard.tsx` (unused)
- Delete `AdminProtected.tsx` (replaced by UnifiedAdminGuard)
- Delete `simple-admin-auth.ts` (legacy wrapper)
- Delete `ConditionalLayout.tsx` (unnecessary after route groups)
- Remove duplicate logo pages from root (keep only under `/admin/`)

---

## 6. Directory Structure

### Final Target State

```
src/
├── modules/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminLayoutContent.tsx
│   │   │   ├── UnifiedAdminGuard.tsx
│   │   │   ├── SecureLoginForm.tsx
│   │   │   ├── AdvancedNewsEditor.tsx
│   │   │   ├── BeautifulEditor.tsx
│   │   │   ├── PerformanceMonitor.tsx
│   │   │   ├── AdSlot.tsx
│   │   │   ├── LogoManager.tsx
│   │   │   ├── rbac/
│   │   │   │   └── index.tsx
│   │   │   └── dashboard/
│   │   │       ├── RoleBasedDashboard.tsx
│   │   │       └── RouteGuard.tsx
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.ts
│   │   │   ├── useAdminToken.ts
│   │   │   └── useSecureAuth.ts
│   │   ├── lib/
│   │   │   ├── admin-client.ts
│   │   │   ├── unified-admin-auth.ts
│   │   │   ├── rbac-auth.ts
│   │   │   ├── secure-auth.ts
│   │   │   ├── get-admin-token.ts
│   │   │   ├── audit-logger.ts
│   │   │   └── security.ts
│   │   ├── config/
│   │   │   ├── rbac.ts
│   │   │   └── api-endpoints.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── reader/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── NewsCard.tsx
│   │   │   ├── ArticlePreview.tsx
│   │   │   ├── CategoryFilters.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── Newsletter.tsx
│   │   │   ├── MarketWidget.tsx
│   │   │   ├── SaveButton.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── FollowButton.tsx
│   │   │   ├── QuickNav.tsx
│   │   │   └── SortControl.tsx
│   │   ├── hooks/
│   │   │   ├── useCategories.ts
│   │   │   └── useSubCategoryFilters.ts
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── categoryUtils.ts
│   │   │   └── contentUtils.ts
│   │   ├── config/
│   │   │   ├── categoryThemes.ts
│   │   │   └── api-endpoints.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── shared/
│       ├── components/
│       │   ├── DivergenceMark.tsx
│       │   ├── Breadcrumb.tsx
│       │   ├── Loading.tsx
│       │   ├── ThemeToggle.tsx
│       │   ├── ContactInfo.tsx
│       │   ├── LogoGallery.tsx
│       │   ├── LogoHistory.tsx
│       │   └── icons/
│       │       └── EditorialIcons.tsx
│       ├── hooks/
│       │   ├── useMarketData.ts
│       │   ├── useSiteConfig.ts
│       │   └── useSiteStats.ts
│       ├── lib/
│       │   ├── api-client.ts
│       │   ├── api.ts
│       │   ├── api-middleware.ts
│       │   ├── utils.ts
│       │   ├── config.ts
│       │   ├── database.ts
│       │   ├── error-handler.ts
│       │   ├── toast.ts
│       │   ├── location-service.ts
│       │   ├── market-data.ts
│       │   └── site-config-cache.ts
│       ├── config/
│       │   ├── site.ts
│       │   └── market-indices.ts
│       ├── types/
│       │   ├── api.ts
│       │   └── market.ts
│       ├── contexts/
│       │   ├── ThemeContext.tsx
│       │   └── LogoContext.tsx
│       └── styles/
│           └── globals.css
│
├── app/
│   ├── layout.tsx              ← Root: ThemeProvider, metadata, fonts only
│   ├── not-found.tsx
│   │
│   ├── (reader)/
│   │   ├── layout.tsx          ← Header + Footer wrapper
│   │   ├── page.tsx            ← Homepage
│   │   ├── category/
│   │   ├── article/
│   │   ├── news/
│   │   ├── trending/
│   │   ├── auth/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── careers/
│   │   ├── services/
│   │   ├── advertise/
│   │   ├── ... (all public pages)
│   │   └── profile/
│   │
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx      ← AdminGuard + Sidebar
│   │       ├── login/
│   │       ├── page.tsx
│   │       ├── content/
│   │       ├── analytics/
│   │       ├── users/
│   │       ├── system/
│   │       └── ...
│   │
│   └── api/                    ← API routes stay flat
│       ├── admin/
│       ├── auth/
│       ├── articles/
│       ├── categories/
│       └── market/
```

---

## 7. Shared Module Contract

The shared module is the **only** bridge between admin and reader code. It must be:

- **Stable** — changes to shared types should be backward-compatible
- **Lean** — no business logic specific to admin or reader
- **Well-typed** — all exports should have explicit TypeScript types

### Shared Exports (public API)

```typescript
// @shared/components
export { DivergenceMark } from './components/DivergenceMark';
export { Breadcrumb } from './components/Breadcrumb';
export { Loading } from './components/Loading';
export { ThemeToggle } from './components/ThemeToggle';
export { ContactInfo } from './components/ContactInfo';

// @shared/hooks
export { useMarketData } from './hooks/useMarketData';
export { useSiteConfig } from './hooks/useSiteConfig';
export { useSiteStats } from './hooks/useSiteStats';

// @shared/lib
export { apiClient } from './lib/api-client';
export { cn } from './lib/utils';
export { db } from './lib/database';
export { handleError } from './lib/error-handler';
export { showToast } from './lib/toast';

// @shared/types
export type { Article, Category, User, ApiResponse } from './types/api';
export type { MarketData, Index, Currency } from './types/market';

// @shared/config
export { siteConfig } from './config/site';
export { marketIndices } from './config/market-indices';

// @shared/contexts
export { ThemeContext, ThemeProvider } from './contexts/ThemeContext';
export { LogoContext, LogoProvider } from './contexts/LogoContext';
```

### Barrel Export Rule

Each module gets an `index.ts` barrel file for its public API. Internal files import freely within the module, but cross-module imports should go through barrels:

```typescript
// ✅ Correct — cross-module import via barrel
import { DivergenceMark } from '@shared/components';

// ❌ Wrong — reaching into module internals
import { DivergenceMark } from '@shared/components/DivergenceMark';
// (allowed during migration, enforce barrels later)
```

---

## 8. Authentication Consolidation

### Current State: 6 Auth Modules

| Module | LOC | Used | Action |
|--------|-----|------|--------|
| `unified-admin-auth.ts` | ~400 | ✅ Primary | **KEEP** → move to `@admin/lib/` |
| `simple-admin-auth.ts` | ~50 | ❌ Legacy wrapper | **DELETE** |
| `admin-jwt-bridge.ts` | ~100 | ✅ Token generation | **MERGE** into unified-admin-auth |
| `rbac-auth.ts` | ~200 | ✅ RBAC layer | **KEEP** → move to `@admin/lib/` |
| `secure-auth.ts` | ~150 | ⚠️ Partially used | **MERGE** useful parts into admin-auth |
| `auth.ts` (user) | ~200 | ✅ Primary user auth | **KEEP** → move to `@reader/lib/` |

### Target: 2 Auth Modules

```
@admin/lib/admin-auth.ts    ← Consolidated admin auth (unified + jwt bridge + secure)
@reader/lib/auth.ts         ← User JWT auth (unchanged)
```

### Guard Component Simplification

| Component | Action |
|-----------|--------|
| `UnifiedAdminGuard.tsx` | **KEEP** — single admin guard |
| `SecureAdminGuard.tsx` | **DELETE** |
| `SimpleAdminGuard.tsx` | **DELETE** |
| `AdminProtected.tsx` | **DELETE** |
| `admin/RouteGuard.tsx` | **MERGE** RBAC checks into UnifiedAdminGuard |

### Backend Auth Middleware Split

```typescript
// BEFORE: Single function in backend/src/middleware/auth.ts
export function authenticateToken(req, res, next) {
  // Handles both JWT and base64 admin tokens in one function
}

// AFTER: Two explicit middlewares
// backend/src/middleware/userAuth.ts
export function authenticateUser(req, res, next) {
  // Only handles real JWT tokens
  // jwt.verify() with JWT_SECRET
}

// backend/src/middleware/adminAuth.ts
export function authenticateAdmin(req, res, next) {
  // Only handles admin tokens
  // Validates against admin credentials
  // Checks RBAC permissions
}
```

---

## 9. API Route Separation

### Next.js API Routes

No structural change needed — admin routes are already under `src/app/api/admin/`. User routes are under `src/app/api/auth/`, `src/app/api/articles/`, etc.

**Action items:**
- Move admin API endpoint constants from `src/config/api.ts` → `@admin/config/api-endpoints.ts`
- Move reader API endpoint constants → `@reader/config/api-endpoints.ts`
- Keep shared API constants (base URL, error codes) → `@shared/config/api.ts`

### Backend Express Routes

**Current problem:** `backend/src/routes/admin.ts` is 2,366 lines.

**Refactor into sub-routes:**

```
backend/src/routes/admin/
├── index.ts                ← Router aggregation + shared admin middleware
├── users.ts                ← User management endpoints
├── content.ts              ← Article CRUD, drafts, publishing
├── analytics.ts            ← Stats, traffic, engagement
├── system.ts               ← Settings, backups, integrations, audit
├── market-config.ts        ← Market indices, currencies, crypto config
├── moderation.ts           ← Reports, spam, content moderation
└── newsletter.ts           ← Newsletter management
```

Each sub-route file:
```typescript
// backend/src/routes/admin/users.ts
import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/adminAuth';

const router = Router();

// All routes here automatically require admin auth
router.use(authenticateAdmin);

router.get('/', /* list users */);
router.get('/:id', /* get user */);
router.put('/:id/role', /* update role */);
router.delete('/:id', /* delete user */);

export default router;
```

Aggregated in index:
```typescript
// backend/src/routes/admin/index.ts
import { Router } from 'express';
import usersRouter from './users';
import contentRouter from './content';
import analyticsRouter from './analytics';
import systemRouter from './system';
import marketConfigRouter from './market-config';

const router = Router();

router.use('/users', usersRouter);
router.use('/content', contentRouter);
router.use('/analytics', analyticsRouter);
router.use('/system', systemRouter);
router.use('/market-config', marketConfigRouter);

export default router;
```

---

## 10. Backend Refactoring

### Current Backend Structure

```
backend/src/
├── index.ts
├── config/
├── middleware/
│   └── auth.ts          ← Single auth middleware (handles both)
├── routes/
│   ├── admin.ts         ← 2,366 lines (monoliths)
│   ├── articles.ts      ← Mixed admin/reader endpoints
│   ├── auth.ts
│   └── ...
└── types/
```

### Target Backend Structure

```
backend/src/
├── index.ts
├── config/
├── middleware/
│   ├── userAuth.ts      ← JWT-based user authentication
│   ├── adminAuth.ts     ← Admin token authentication + RBAC
│   ├── rateLimiter.ts   ← Rate limiting (different limits for admin vs user)
│   └── common.ts        ← Shared middleware (logging, CORS, error handling)
├── routes/
│   ├── admin/           ← All admin routes (split from single file)
│   │   ├── index.ts
│   │   ├── users.ts
│   │   ├── content.ts
│   │   ├── analytics.ts
│   │   ├── system.ts
│   │   └── market-config.ts
│   ├── public/          ← Explicitly public routes
│   │   ├── articles.ts  ← GET /articles (listing only)
│   │   ├── categories.ts
│   │   └── market.ts
│   ├── auth.ts          ← User authentication
│   ├── user/            ← Authenticated user routes
│   │   ├── preferences.ts
│   │   ├── saved.ts
│   │   └── comments.ts
│   ├── health.ts
│   └── debug.ts
└── types/
```

### Route Mounting

```typescript
// backend/src/index.ts
app.use('/api/admin', adminRouter);      // All require authenticateAdmin
app.use('/api/auth', authRouter);        // Public (register, login)
app.use('/api/user', userRouter);        // All require authenticateUser
app.use('/api/articles', publicArticlesRouter);   // Public GET, admin POST/PUT/DELETE
app.use('/api/categories', publicCategoriesRouter);
app.use('/api/market', marketRouter);    // Public
```

---

## 11. Build & Deployment Changes

### Bundle Splitting (already partially configured)

The existing `next.config.js` already has an admin chunk split:

```javascript
admin: {
  test: /[\\/]src[\\/](components|pages)[\\/].*admin.*[\\/]/,
  name: 'admin',
  chunks: 'all',
  priority: 10,
},
```

After migration, update to match new paths:

```javascript
admin: {
  test: /[\\/]src[\\/]modules[\\/]admin[\\/]/,
  name: 'admin',
  chunks: 'all',
  priority: 10,
},
reader: {
  test: /[\\/]src[\\/]modules[\\/]reader[\\/]/,
  name: 'reader',
  chunks: 'all',
  priority: 10,
},
```

### Docker — No Changes Required

The current `docker-compose.yml` runs frontend as a single container. Route groups don't change the deployment model. The build will still produce one Next.js app; admin pages will just be code-split into separate chunks.

### Future: Independent Deployment (Optional)

If admin traffic is negligible compared to reader traffic, we could later:
1. Move `(admin)` route group into a separate Next.js app in a monorepo workspace
2. Deploy admin on a smaller instance with restricted network access
3. Share the `@shared/*` module via workspace symlinks

This is **not** part of the current proposal but the module boundary structure makes it trivially achievable later.

---

## 12. Risk Assessment

### High Risk

| Risk | Mitigation |
|------|-----------|
| Import path breakage across ~90 pages | Automate with codemod script (`jscodeshift`). Test every import change. |
| Route group layout nesting issues | Test layout rendering carefully. Route groups only affect layout nesting, not URL paths. |
| Admin auth regression | Admin auth is client-side — unit test the `UnifiedAdminGuard` and `unified-admin-auth` thoroughly before moving. |

### Medium Risk

| Risk | Mitigation |
|------|-----------|
| Backend admin.ts split introduces bugs | Split is purely structural — extract functions into files, keep logic identical. Add integration tests for admin endpoints before splitting. |
| ESLint boundary rules are too strict initially | Start in `warn` mode, promote to `error` after all violations are fixed. |
| Development velocity hit during migration | Perform migration per-phase in dedicated PRs. Each PR should be independently deployable. |

### Low Risk

| Risk | Mitigation |
|------|-----------|
| Docker build size increase | Module boundaries don't increase build size; tree-shaking actually improves it. |
| Third-party dependency conflicts | No dependency changes — just file reorganization. |

---

## 13. Implementation Phases

### Phase 1: Foundation (1–2 days)
- [ ] Create `src/modules/{admin,reader,shared}/` skeleton with empty `index.ts` barrels
- [ ] Add `@admin/*`, `@reader/*`, `@shared/*` path aliases to `tsconfig.json`
- [ ] Add `next.config.js` webpack alias support for new paths
- [ ] Verify the app builds with both old (`@/*`) and new aliases active

### Phase 2: Shared Module (2–3 days)
- [ ] Move shared components: `DivergenceMark`, `Breadcrumb`, `Loading`, `ThemeToggle`, `ContactInfo`, `LogoGallery`, `LogoHistory`, `EditorialIcons`
- [ ] Move shared hooks: `useMarketData`, `useSiteConfig`, `useSiteStats`
- [ ] Move shared lib: `utils.ts`, `api-client.ts`, `database*.ts`, `error-handler.ts`, `toast.ts`, `location-service.ts`, all `market-*.ts`
- [ ] Move shared config: `site.ts`, `market-indices.ts`
- [ ] Move shared types: `api.ts`, `market.ts`
- [ ] Move contexts: `ThemeContext.tsx`, `LogoContext.tsx`
- [ ] Update all imports across the codebase (automated via codemod)
- [ ] Verify build + manual smoke test

### Phase 3: Admin Module (2–3 days)
- [ ] Move admin components (guards, editors, RBAC, dashboard, AdSlot, LogoManager)
- [ ] Move admin hooks (`useAdminAuth`, `useAdminToken`, `useSecureAuth`)
- [ ] Move admin lib (all `admin-*.ts`, `rbac-auth.ts`, `secure-auth.ts`, `audit-logger.ts`, `security.ts`)
- [ ] Move admin config (`rbac.ts`, extract admin endpoints from `api.ts`)
- [ ] Delete deprecated: `SimpleAdminGuard`, `SecureAdminGuard`, `AdminProtected`, `simple-admin-auth.ts`
- [ ] Consolidate `admin-jwt-bridge.ts` into `unified-admin-auth.ts`
- [ ] Update all admin page imports
- [ ] Verify build + test admin login, dashboard, content management

### Phase 4: Reader Module (1–2 days)
- [ ] Move reader components (`Header`, `Footer`, `ArticleCard`, `NewsCard`, etc.)
- [ ] Move reader hooks (`useCategories`, `useSubCategoryFilters`)
- [ ] Move reader lib (`auth.ts`, `categoryUtils.ts`, `contentUtils.ts`)
- [ ] Move reader config (`categoryThemes.ts`, extract reader endpoints)
- [ ] Update all public page imports
- [ ] Verify build + test homepage, category pages, article pages, auth flow

### Phase 5: Route Groups (1 day)
- [ ] Wrap public pages in `(reader)` route group
- [ ] Wrap admin pages in `(admin)` route group
- [ ] Create `(reader)/layout.tsx` (Header + Footer)
- [ ] Verify URL paths haven't changed
- [ ] Delete `ConditionalLayout.tsx`
- [ ] Remove duplicate root-level logo pages

### Phase 6: Backend Refactoring (2–3 days)
- [ ] Split `backend/src/routes/admin.ts` into sub-modules (`users.ts`, `content.ts`, `analytics.ts`, `system.ts`, `market-config.ts`)
- [ ] Split `backend/src/middleware/auth.ts` into `userAuth.ts` + `adminAuth.ts`
- [ ] Reorganize public/user routes into `public/` and `user/` directories
- [ ] Test all backend endpoints (admin + user)
- [ ] Test backend auth middleware with both token types

### Phase 7: Enforcement & Cleanup (1 day)
- [ ] Add ESLint `no-restricted-imports` rules for module boundaries
- [ ] Update `next.config.js` webpack chunk splitting regex
- [ ] Remove old empty directories from `src/components/`, `src/hooks/`, `src/lib/`, `src/config/`
- [ ] Update documentation (Architecture.md, Contributing guide)
- [ ] Final full-app smoke test

### Total Estimated Effort: 10–15 days

---

## 14. Success Criteria

| Metric | Before | After |
|--------|--------|-------|
| Admin code leaking into reader bundle | ✅ Happens | ❌ Prevented by module boundaries |
| Auth modules in `src/lib/` | 6 | 2 (one admin, one reader) |
| Admin guard components | 4 | 1 (`UnifiedAdminGuard`) |
| `backend/routes/admin.ts` size | 2,366 lines | ~300 lines/file (6 files) |
| Backend auth middleware functions | 1 (mixed) | 2 (explicit user + admin) |
| Cross-module imports (admin↔reader) | Untracked | 0 (ESLint enforced) |
| Duplicate pages (logo-manager etc.) | 3 pages | 0 |
| Dead code files | ~5 | 0 |
| Import path clarity | `@/components/UnifiedAdminGuard` | `@admin/components/UnifiedAdminGuard` |
| Build passes with Turbopack | ✅ | ✅ |
| All existing URLs unchanged | — | ✅ |
| Admin login + all admin features work | ✅ | ✅ |
| User auth + all reader features work | ✅ | ✅ |

---

## Appendix A: Codemod Script (Automated Import Rewriting)

A `jscodeshift` codemod will be created to automate import path changes. Example transform:

```javascript
// Transform: @/components/DivergenceMark → @shared/components/DivergenceMark
// Transform: @/hooks/useAdminAuth → @admin/hooks/useAdminAuth
// Transform: @/lib/auth → @reader/lib/auth

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const importMap = {
    // shared components
    '@/components/DivergenceMark': '@shared/components/DivergenceMark',
    '@/components/Breadcrumb': '@shared/components/Breadcrumb',
    '@/components/Loading': '@shared/components/Loading',
    '@/components/ThemeToggle': '@shared/components/ThemeToggle',
    // admin components
    '@/components/UnifiedAdminGuard': '@admin/components/UnifiedAdminGuard',
    '@/components/AdminLayoutContent': '@admin/components/AdminLayoutContent',
    // reader components
    '@/components/Header': '@reader/components/Header',
    '@/components/Footer': '@reader/components/Footer',
    // ... full mapping
  };

  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (importMap[source]) {
      path.node.source.value = importMap[source];
    }
  });

  return root.toSource();
};
```

## Appendix B: Files to Delete

| File | Reason |
|------|--------|
| `src/components/AdminProtected.tsx` | Replaced by UnifiedAdminGuard |
| `src/components/SecureAdminGuard.tsx` | Unused legacy guard |
| `src/components/SimpleAdminGuard.tsx` | Unused legacy guard |
| `src/components/ConditionalLayout.tsx` | Unnecessary after route groups |
| `src/lib/simple-admin-auth.ts` | Legacy wrapper over UnifiedAdminAuth |
| `src/lib/admin-jwt-bridge.ts` | Merge into unified-admin-auth.ts |
| `src/contexts/AdminThemeContext.tsx` | Empty file |
| `src/app/logo-manager/` | Duplicate of admin/logo-manager |
| `src/app/logo-history/` | Duplicate of admin/logo-history |

## Appendix C: Token Storage Cleanup

| Key | Owner | Action |
|-----|-------|--------|
| `newstrnt_admin_session` (localStorage) | Admin | Keep — primary admin session |
| `admin_session` (sessionStorage) | Admin | Keep — session backup |
| `adminToken` (localStorage) | Admin | Keep — admin API token |
| `newstrnt_admin_jwt_token` (localStorage) | Admin | Merge into `adminToken` |
| `token` (localStorage) | **CONFLICT** | Remove — both admin and user use this key |
| `newsnerve_auth_token` (localStorage) | Reader | Keep — user JWT |

Resolve the `token` key conflict by having each module use only its namespaced key.
