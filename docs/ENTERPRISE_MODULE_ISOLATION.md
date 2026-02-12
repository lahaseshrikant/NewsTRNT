# NewsTRNT — Enterprise Module Isolation Architecture

> **Status:** RFC v2 — Awaiting Confirmation  
> **Author:** Engineering  
> **Date:** 2026-02-12  
> **Supersedes:** RFC v1 (Supabase dual-access pattern — removed)  
> **Scope:** Full-stack system isolation — DB, Backend, Frontend, Deployment  
> **Key Decision:** All database access through Express + Prisma ONLY. No client-side DB access.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Current State Audit](#3-current-state-audit)
4. [Target Architecture](#4-target-architecture)
5. [Service Directory Structure](#5-service-directory-structure)
6. [Database Architecture](#6-database-architecture)
7. [Backend Architecture](#7-backend-architecture)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Real-time Strategy (Socket.io)](#9-real-time-strategy-socketio)
10. [Caching Strategy (Redis)](#10-caching-strategy-redis)
11. [Authentication Strategy](#11-authentication-strategy)
12. [Environment Variable Strategy](#12-environment-variable-strategy)
13. [Deployment Plan](#13-deployment-plan)
14. [Migration Steps](#14-migration-steps)
15. [Production Security Checklist](#15-production-security-checklist)
16. [Risk Assessment](#16-risk-assessment)
17. [Phase Timeline & Milestones](#17-phase-timeline--milestones)

---

## 1. Executive Summary

### Problem

NewsTRNT currently runs as a **single Next.js monolith** with a **single Express backend** and a **flat PostgreSQL schema**. Admin CMS and public reader code share everything — components, auth modules, API routes, database credentials, and deployment infrastructure. The frontend also has a direct Supabase client connection to the database, bypassing the backend entirely — a security and architecture anti-pattern.

### Solution

Split into **four isolated modules** using a clean monorepo layout — frontends in `apps/`, backends in `services/`. All database access flows through **Express + Prisma backends only**. No frontend ever touches the database directly.

| Module | Folder | Stack | Port | DB Role |
|--------|--------|-------|------|---------|
| **user-frontend** | `apps/user-frontend/` | Next.js 15, React 19, Tailwind v4 | 3000 | NONE (calls user-backend API) |
| **user-backend** | `services/user-backend/` | Express, Prisma, Redis, Socket.io | 5000 | `user_api_user` (restricted) |
| **admin-frontend** | `apps/admin-frontend/` | Next.js 15, React 19, Tailwind v4, TipTap | 3001 | NONE (calls admin-backend API) |
| **admin-backend** | `services/admin-backend/` | Express, Prisma, Redis, Socket.io, OpenAI, Nodemailer | 5002 | `admin_api_user` (full access) |

Supporting services (unchanged):

| Service | Location | Stack |
|---------|----------|-------|
| **scraper-ai** | `scraper-ai/` | Python, OpenAI, NewsAPI |
| **PostgreSQL** | Neon (cloud) | PostgreSQL 15 |
| **Redis** | Docker / cloud | Redis 7 |

### Key Principles

1. **Backend-only database access** — Frontends NEVER touch the database. All queries go through Express APIs + Prisma ORM.
2. **No Supabase client** — Removed entirely. `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs` are deleted from dependencies.
3. **Zero shared code** — Admin and user services are fully independent. No shared imports.
4. **Schema isolation** — Three PostgreSQL schemas (`public`, `auth`, `admin`) with role-based access.
5. **Real-time via Socket.io** — Live updates (breaking news, comments, notifications) delivered through WebSocket, not client-side DB subscriptions.
6. **Performance via Redis** — High-read data (articles, categories, market data) cached in Redis with TTL-based invalidation. No need for direct DB access from frontend.
7. **Network isolation** — Admin services are never publicly discoverable.
8. **Independent deployment** — Ship reader fixes without touching admin. Ship admin features without rebuilding reader.
9. **Clean naming convention** — Frontends in `apps/` (user-frontend, admin-frontend), backends in `services/` (user-backend, admin-backend).

### What Was Removed

| Technology | Reason |
|-----------|--------|
| `@supabase/supabase-js` | Replaced by backend API calls + Redis cache |
| `@supabase/auth-helpers-nextjs` | Not needed; auth handled via JWT + backend |
| `src/lib/database.ts` (Supabase client) | Deleted; all queries go through user-backend |
| `src/lib/database-real.ts` | Deleted; Supabase-related |
| `src/lib/database-mock.ts` | Deleted; Supabase-related |
| Direct frontend → DB connection | Security anti-pattern eliminated |

---

## 2. Tech Stack

### user-frontend (Next.js — Reader App)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.4.5 | React framework, SSR/ISR, App Router, Turbopack |
| React | 19.1.0 | UI library |
| Tailwind CSS | v4 | Utility-first styling |
| @tailwindcss/typography | ^0.5.19 | Prose styling for articles |
| @heroicons/react | ^2.2.0 | Icon library |
| lucide-react | ^0.536.0 | Icon library |
| socket.io-client | ^4.7.4 | Real-time WebSocket client |
| jsonwebtoken | ^9.0.2 | JWT token handling |
| html-to-image | ^1.11.13 | Screenshot/export utility |
| critters | ^0.0.23 | CSS inlining for performance |

### admin-frontend (Next.js — Admin CMS)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.4.5 | React framework (CSR/SPA mode) |
| React | 19.1.0 | UI library |
| Tailwind CSS | v4 | Utility-first styling |
| @tiptap/react + 15 extensions | ^3.4.2–3.6.1 | Rich text editor (admin-only) |
| socket.io-client | ^4.7.4 | Real-time WebSocket client |

### user-backend (Express — Reader API)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | ^4.18.3 | HTTP server framework |
| @prisma/client | ^6.16.2 | Database ORM (ONLY way to access DB) |
| Prisma CLI | ^6.16.2 | Migrations, generation |
| jsonwebtoken | ^9.0.2 | JWT auth for users |
| bcryptjs | ^2.4.3 | Password hashing |
| cors | ^2.8.5 | Cross-origin requests |
| helmet | ^7.1.0 | Security headers |
| morgan | ^1.10.1 | HTTP request logging |
| compression | ^1.8.1 | Response compression |
| express-rate-limit | ^7.1.5 | Rate limiting |
| redis | ^4.6.13 | Caching layer (articles, categories, market data) |
| socket.io | ^4.7.4 | Real-time WebSocket server |
| multer | ^1.4.5-lts.1 | File upload handling |
| zod | ^3.22.4 | Request validation |
| validator | ^13.11.0 | Input sanitization |
| uuid | ^9.0.1 | ID generation |
| dotenv | ^16.4.5 | Environment variables |
| ts-node-dev | ^2.0.0 | Dev server with hot reload |

### admin-backend (Express — Admin API)

| Technology | Version | Purpose |
|-----------|---------|---------|
| All user-backend deps | — | Same base stack |
| openai | ^4.28.4 | AI summarization |
| nodemailer | ^6.9.13 | Email sending |
| Lexical | ^0.35.0 (6 pkgs) | Rich text processing (server-side) |

### Database & Infrastructure

| Technology | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 15 | Primary database (Neon cloud) |
| Prisma ORM | ^6.16.2 | **SOLE** database access layer |
| Redis | 7 | Caching, sessions, pub/sub for Socket.io |
| Docker Compose | 3.8 | Local development orchestration |
| TypeScript | ^5.x | All services |

---

## 3. Current State Audit

### 3.1 Database — Single Flat Schema

All ~43 tables in the default `public` schema with one shared `DATABASE_URL`.

**Current anti-pattern:** Frontend has direct Supabase client connection in `src/lib/database.ts` bypassing backend. Functions like `getArticles()`, `getFeaturedArticles()`, `searchArticles()`, `getCategories()` query PostgreSQL directly from the browser.

**Fix:** Delete `src/lib/database.ts`. All these queries become `user-backend` API endpoints. Frontend calls `NEXT_PUBLIC_API_URL/api/articles` instead.

### 3.2 Backend — Single Express Server (`backend/`)

- `backend/src/index.ts` — One Express app mounting 12 route files on port 5000
- `backend/src/routes/admin.ts` — **2,366-line monolith** handling all admin operations
- `backend/src/middleware/auth.ts` — Single `authenticateToken()` handling both JWT (users) and base64 RBAC tokens (admin) in one fragile `if/else`
- `backend/src/middleware/errorHandler.ts` — Error handling
- `backend/src/middleware/requestLogger.ts` — Request logging (Morgan)
- `backend/src/config/database.ts` — Prisma client initialization

**Route files (12):** `admin.ts`, `articles.ts`, `auth.ts`, `categories.ts`, `comments.ts`, `content.ts`, `debug.ts`, `health.ts`, `market.ts`, `stats.ts`, `user-preferences.ts`, `webstories.ts`

### 3.3 Frontend — Single Next.js App (Root `/`)

**Pages (~55 admin + ~40 reader):**
- Reader: homepage, 8 category desks, article, news, trending, opinion, analysis, shorts, web-stories, auth (signin/signup), profile, saved, settings, notifications, interests, search, about, contact, careers, services, advertise, press, developers, privacy, terms, cookies, sitemap, subscription, help
- Admin: `admin/*` pages
- Debug/legacy: `logo-manager/`, `logo-history/`, `logo-showcase/`, `test-market-api/`, `dashboard/`

**Components (35+):** Header, Footer, ArticleCard, NewsCard, DivergenceMark, ArticlePreview, CategoryFilters, CommentSection, Newsletter, MarketWidget, SaveButton, ShareButton, FollowButton, QuickNav, SortControl, Breadcrumb, ContactInfo, Loading, ThemeToggle, AdminLayoutContent, AdminProtected, AdSlot, AdvancedNewsEditor, BeautifulEditor, LogoManager, LazyLogoManager, LogoGallery, LogoHistory, PerformanceMonitor, SecureLoginForm, UnifiedAdminGuard, SecureAdminGuard, SimpleAdminGuard, ConditionalLayout, `admin/`, `rbac/`, icons/

**Lib files (34 in `src/lib/`):** Including `database.ts` (Supabase — TO DELETE), `database-real.ts` (TO DELETE), `database-mock.ts` (TO DELETE), plus auth, api-client, market libs, and admin libs (TO MOVE)

**Hooks (8):** useCategories, useSubCategoryFilters, useMarketData, useSiteConfig, useSiteStats (reader), useAdminAuth, useAdminToken, useSecureAuth (admin — TO MOVE)

**Contexts (3):** ThemeContext, LogoContext (reader), AdminThemeContext (TO DELETE — empty)

**Config (5):** site.ts, categoryThemes.ts, market-indices.ts, api.ts (reader), rbac.ts (admin — TO MOVE)

### 3.4 Deployment — Docker Compose (5 services)

`postgres` (5432), `backend` (5000), `frontend` (3000), `scraper` (Python), `redis` (6379)

---

## 4. Target Architecture

### System Diagram

```
                    ┌──────────────────────────────────────────────────┐
                    │                INTERNET / CDN                      │
                    │           (Vercel Edge Network)                    │
                    └─────────────────┬────────────────────────────────┘
                                      │
                    ┌─────────────────▼────────────────────────────────┐
                    │     user-frontend (apps/user-frontend/)            │
                    │     Next.js 15 (SSR/ISR/Edge)                    │
                    │     Domain: newstrnt.com                          │
                    │     Port: 3000                                    │
                    │     ❌ NO direct DB access                        │
                    └──────┬──────────────────────┬────────────────────┘
                           │ HTTPS (REST API)     │ WebSocket
                           │                      │ (Socket.io client)
                    ┌──────▼──────────────────────▼────────────────────┐
                    │     user-backend (services/user-backend/)         │
                    │     Express + Prisma + Redis + Socket.io          │
                    │     Port: 5000                                    │
                    │     DB Role: user_api_user (restricted)           │
                    │     ✅ SOLE DB access for user-facing data        │
                    └──────┬───────────────────────────────────────────┘
                           │
       ┌───────────────────▼───────────────────────────────────────────┐
       │                        POSTGRESQL (Neon)                       │
       │    ┌──────────────┬──────────────┬──────────────┐              │
       │    │   public.*   │    auth.*    │   admin.*    │              │
       │    │  (content)   │   (users)   │   (CMS/ops)  │              │
       │    └──────────────┴──────────────┴──────────────┘              │
       └───────────────────▲───────────────────────────────────────────┘
                           │
                    ┌──────┴───────────────────────────────────────────┐
                    │     admin-backend (services/admin-backend/)       │
                    │     Express + Prisma + Redis + Socket.io          │
                    │     + OpenAI + Nodemailer + Lexical               │
                    │     Port: 5002                                    │
                    │     DB Role: admin_api_user (full access)         │
                    └──────▲───────────────────────────────────────────┘
                           │ HTTPS (VPN/Private) + WebSocket
                    ┌──────┴───────────────────────────────────────────┐
                    │     admin-frontend (apps/admin-frontend/)          │
                    │     Next.js 15 (SPA/CSR)                         │
                    │     TipTap + Lexical editors                      │
                    │     Domain: admin.newstrnt.com (IP-restricted)    │
                    │     Port: 3001                                    │
                    │     ❌ NO direct DB access                        │
                    └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │  SUPPORTING SERVICES (all on private network)                        │
  │  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
  │  │   Redis 7   │  │  scraper-ai/     │  │  Neon (PostgreSQL 15)   │ │
  │  │  caching    │  │  Python pipeline │  │  Branching: dev/prod    │ │
  │  │  pub/sub    │  │                  │  │                         │ │
  │  │  sessions   │  │                  │  │                         │ │
  │  └─────────────┘  └──────────────────┘  └─────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────┘
```

### Data Flow Rules

```
  user-frontend  ──→  user-backend (Express+Prisma+Redis)  ──→  PostgreSQL
  user-frontend  ──→  user-backend (Socket.io)             ──→  Real-time events
  admin-frontend ──→  admin-backend (Express+Prisma+Redis) ──→  PostgreSQL
  admin-frontend ──→  admin-backend (Socket.io)            ──→  Real-time events
  scraper-ai     ──→  PostgreSQL (via admin_api_user credentials)

  ✅ user-backend reads public.*, reads/writes auth.*
  ✅ admin-backend reads/writes ALL schemas (public, auth, admin)
  ✅ Redis caches high-read data (articles, categories, market data)
  ✅ Socket.io pushes real-time updates (breaking news, comments, notifications)

  ❌ user-frontend NEVER touches database directly
  ❌ admin-frontend NEVER touches database directly
  ❌ user-backend CANNOT access admin.* schema
  ❌ user-frontend cannot discover admin-backend URL
  ❌ No shared code between admin and user services
  ❌ No @supabase/supabase-js anywhere in the codebase
```

---

## 5. Directory Structure

**Frontends in `apps/`. Backends in `services/`. Supporting files at repo root.**

```
news-platform/                              ← Git root (monorepo)
│
├── apps/                                   ← Frontend applications
│   │
│   ├── user-frontend/                      ← Reader-facing Next.js app
│   │   ├── package.json                    ← No Supabase, no TipTap
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── eslint.config.mjs
│   │   ├── middleware.ts                   ← Next.js middleware
│   │   ├── next-env.d.ts
│   │   ├── Dockerfile
│   │   ├── public/                         ← Static assets
│   │   │   └── uploads/images/
│   │   └── src/
│   │       ├── app/                        ← Reader pages ONLY (no admin/)
│   │       │   ├── layout.tsx              ← Always Header + Footer
│   │       │   ├── page.tsx                ← Homepage
│   │       │   ├── about/, advertise/, analysis/, article/, articles/
│   │       │   ├── auth/, careers/, category/, contact/, cookies/
│   │       │   ├── dashboard/, developers/, help/, interests/
│   │       │   ├── login/, news/, notifications/, opinion/
│   │       │   ├── press/, privacy/, profile/, register/
│   │       │   ├── saved/, search/, services/, settings/
│   │       │   ├── shorts/, sitemap/, subscription/, terms/
│   │       │   ├── trending/, web-stories/
│   │       │   └── globals.css
│   │       ├── components/                 ← Reader components ONLY
│   │       │   ├── Header.tsx, Footer.tsx, DivergenceMark.tsx
│   │       │   ├── ArticleCard.tsx, NewsCard.tsx, ArticlePreview.tsx
│   │       │   ├── CategoryFilters.tsx, CommentSection.tsx
│   │       │   ├── Newsletter.tsx, MarketWidget.tsx
│   │       │   ├── SaveButton.tsx, ShareButton.tsx, FollowButton.tsx
│   │       │   ├── QuickNav.tsx, SortControl.tsx, Breadcrumb.tsx
│   │       │   ├── ContactInfo.tsx, Loading.tsx, ThemeToggle.tsx
│   │       │   └── icons/
│   │       ├── hooks/                      ← Reader hooks ONLY (5 files)
│   │       │   ├── useCategories.ts
│   │       │   ├── useSubCategoryFilters.ts
│   │       │   ├── useMarketData.ts
│   │       │   ├── useSiteConfig.ts
│   │       │   └── useSiteStats.ts
│   │       ├── lib/                        ← Reader libs ONLY
│   │       │   ├── api-client.ts           ← HTTP client → user-backend
│   │       │   ├── auth.ts                 ← User JWT auth
│   │       │   ├── api.ts, api-middleware.ts
│   │       │   ├── utils.ts, categoryUtils.ts, contentUtils.ts
│   │       │   ├── toast.ts, error-handler.ts
│   │       │   ├── config.ts, scalable-config.ts, site-config-cache.ts
│   │       │   ├── location-service.ts
│   │       │   ├── market-auto-update.ts, market-cache.ts
│   │       │   ├── market-config.ts, market-data-service.ts
│   │       │   ├── real-market-data.ts, provider-preferences.ts
│   │       │   └── tradingview-fallback.ts, tradingview-runner.ts
│   │       │   # ❌ NO database.ts, database-real.ts, database-mock.ts
│   │       │   # ❌ NO admin-client.ts, admin-jwt-bridge.ts, rbac-auth.ts, etc.
│   │       ├── config/                     ← site.ts, categoryThemes.ts, market-indices.ts, api.ts
│   │       ├── contexts/                   ← ThemeContext.tsx, LogoContext.tsx
│   │       ├── types/
│   │       └── styles/
│   │
│   └── admin-frontend/                    ← Admin CMS (Next.js)
│       ├── package.json                   ← Next.js + React + Tailwind + TipTap + Lexical
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       ├── middleware.ts                  ← Admin auth enforcement
│       ├── Dockerfile
│       └── src/
│           ├── app/                       ← Admin pages (NO /admin prefix)
│           │   ├── layout.tsx             ← Admin sidebar + guard
│           │   ├── page.tsx               ← Dashboard
│           │   ├── login/, content/, media/, analytics/
│           │   ├── users/, moderation/, advertising/
│           │   ├── newsletter/, market-config/
│           │   ├── system/, config/, help/
│           │   └── globals.css
│           ├── components/                ← Admin components (moved from root src/components/)
│           │   ├── AdminLayoutContent.tsx, AdminGuard.tsx
│           │   ├── SecureLoginForm.tsx, AdvancedNewsEditor.tsx
│           │   ├── BeautifulEditor.tsx, PerformanceMonitor.tsx
│           │   ├── AdSlot.tsx, LogoManager.tsx
│           │   ├── Loading.tsx, ThemeToggle.tsx, Breadcrumb.tsx
│           │   ├── admin/, rbac/, dashboard/
│           │   └── icons/
│           ├── hooks/                     ← useAdminAuth, useAdminToken
│           ├── lib/                       ← admin-auth.ts, admin-client.ts, rbac-auth.ts
│           ├── config/                    ← rbac.ts, api.ts
│           ├── contexts/ThemeContext.tsx
│           └── types/
│
├── services/                               ← Backend API services
│   │
│   ├── user-backend/                       ← Reader API (Express)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   ├── schema.prisma              ← public + auth schemas ONLY (multiSchema)
│   │   │   ├── seed.ts
│   │   │   ├── seed-currencies.ts
│   │   │   ├── seed-market-config.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts                   ← Express app (NO admin route mount)
│   │       ├── config/
│   │       │   ├── database.ts            ← Prisma client init
│   │       │   └── redis.ts               ← Redis client init
│   │       ├── middleware/
│   │       │   ├── auth.ts                ← JWT-ONLY (no base64 RBAC)
│   │       │   ├── cache.ts               ← Redis cache middleware
│   │       │   ├── errorHandler.ts
│   │       │   └── requestLogger.ts
│   │       ├── routes/                    ← 10 route files (NO admin.ts, NO debug.ts)
│   │       │   ├── auth.ts               ← User registration, login, profile
│   │       │   ├── articles.ts           ← Article listing, detail, search, featured
│   │       │   ├── categories.ts         ← Category listing, by-slug
│   │       │   ├── comments.ts           ← Comment CRUD
│   │       │   ├── content.ts            ← Content types
│   │       │   ├── market.ts             ← Market data (indices, crypto, currency)
│   │       │   ├── webstories.ts         ← Web stories listing
│   │       │   ├── user-preferences.ts   ← Saved articles, follows, reading history
│   │       │   ├── stats.ts              ← Public site stats
│   │       │   └── health.ts             ← Health check
│   │       ├── services/                  ← Business logic layer
│   │       │   ├── article.service.ts     ← Replaces Supabase dbApi functions
│   │       │   ├── category.service.ts
│   │       │   ├── market.service.ts
│   │       │   └── cache.service.ts       ← Redis cache helpers
│   │       ├── socket/                    ← Socket.io event handlers
│   │       │   ├── index.ts              ← Socket.io server setup
│   │       │   ├── articles.ts           ← Breaking news, new articles
│   │       │   └── notifications.ts      ← User notifications
│   │       └── types/
│   │
│   └── admin-backend/                     ← Admin API (Express)
│       ├── package.json                   ← All backend deps + OpenAI + Nodemailer + Lexical
│       ├── tsconfig.json
│       ├── Dockerfile
│       ├── prisma/
│       │   ├── schema.prisma             ← ALL tables (public + auth + admin) multiSchema
│       │   └── migrations/
│       └── src/
│           ├── index.ts                  ← Express app for admin APIs
│           ├── config/
│           │   ├── database.ts           ← Prisma client init
│           │   └── redis.ts              ← Redis client init
│           ├── middleware/
│           │   ├── auth.ts               ← Admin RBAC token auth ONLY (no JWT)
│           │   ├── audit.ts              ← Auto-audit logging
│           │   ├── cache.ts              ← Redis cache middleware
│           │   ├── errorHandler.ts
│           │   └── requestLogger.ts
│           ├── routes/                   ← admin.ts (2,366 lines) split into 15 files
│           │   ├── auth.ts, users.ts, content.ts, categories.ts
│           │   ├── webstories.ts, media.ts, analytics.ts
│           │   ├── moderation.ts, advertising.ts, newsletter.ts
│           │   ├── market-config.ts, market.ts, system.ts
│           │   ├── site-config.ts, stats.ts, health.ts
│           ├── services/                 ← Business logic layer
│           ├── socket/                   ← Socket.io for admin real-time
│           │   ├── index.ts
│           │   └── admin-events.ts       ← Content updates, moderation alerts
│           └── types/
│
├── scraper-ai/                            ← COMPLETELY UNCHANGED
│
├── database/                              ← Shared migration scripts (already created)
│   ├── README.md
│   └── migrations/
│       ├── 001_create_schemas.sql
│       ├── 002_move_auth_tables.sql
│       ├── 003_move_admin_tables.sql
│       ├── 004_create_roles_and_permissions.sql
│       └── 005_verify_permissions.sql
│
├── docker-compose.yml                     ← UPDATED for 6 services
├── .gitignore
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       ├── deploy-user-frontend.yml
│       ├── deploy-user-backend.yml
│       ├── deploy-admin-frontend.yml
│       └── deploy-admin-backend.yml
│
├── data/                                  ← STAYS
├── docs/                                  ← STAYS
├── deprecated/                            ← STAYS (move old root src/ files here during migration)
└── portfolio/                             ← STAYS
```

---

## 6. Database Architecture

### 6.1 Single Access Pattern — Prisma Only

**There is now ONE way to access the database: Express backends using Prisma ORM.**

| Service | DB Access | Method |
|---------|-----------|--------|
| user-frontend | ❌ NONE | Calls user-backend REST API |
| user-backend | ✅ `public` + `auth` schemas | Prisma ORM via `user_api_user` |
| admin-frontend | ❌ NONE | Calls admin-backend REST API |
| admin-backend | ✅ ALL schemas | Prisma ORM via `admin_api_user` |
| scraper-ai | ✅ ALL schemas | Direct connection via `admin_api_user` |

### 6.2 Schema Layout

```
PostgreSQL (Neon)  ←  Prisma ORM ONLY (via Express backends)
│
├── Schema: public                      ← Published content (read-heavy, cached in Redis)
│   ├── articles
│   ├── categories
│   ├── subcategories
│   ├── tags
│   ├── article_tags
│   ├── web_stories
│   ├── comments
│   ├── market_indices
│   ├── market_index_history
│   ├── cryptocurrencies
│   ├── crypto_history
│   ├── currency_rates
│   ├── currency_history
│   ├── commodities
│   ├── commodity_history
│   └── site_config
│
├── Schema: auth                        ← User identity & behavior
│   ├── users
│   ├── saved_articles
│   ├── reading_history
│   ├── user_interactions
│   ├── newsletter_subscriptions
│   ├── push_tokens
│   ├── category_follows
│   └── topic_follows
│
└── Schema: admin                       ← CMS, operations, internal
    ├── admin_logs
    ├── analytics_events
    ├── email_templates
    ├── system_backups
    ├── ad_requests
    ├── ad_campaigns
    ├── integrations
    ├── spam_rules
    ├── security_events
    ├── media_files
    ├── moderation_reports
    ├── system_settings
    ├── team_invites
    ├── scraper_runs
    ├── market_index_configs
    ├── cryptocurrency_configs
    ├── commodity_configs
    ├── currency_pair_configs
    └── market_provider_preferences
```

### 6.3 Role Definitions

**user_api_user** (used by `user-backend`):
- `public` schema: SELECT on all tables + INSERT/UPDATE on `comments`
- `auth` schema: SELECT, INSERT, UPDATE + DELETE on `saved_articles`, `category_follows`, `topic_follows`
- `admin` schema: **ZERO ACCESS**

**admin_api_user** (used by `admin-backend`, `scraper-ai`):
- ALL schemas: ALL PRIVILEGES

### 6.4 Prisma Schema Strategy

**user-backend** (`services/user-backend/prisma/schema.prisma`):
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")     // user_api_user credentials
  schemas  = ["public", "auth"]
}

// Only public + auth tables declared
model Article { @@map("articles") @@schema("public") }
model Category { @@map("categories") @@schema("public") }
model User { @@map("users") @@schema("auth") }
model SavedArticle { @@map("saved_articles") @@schema("auth") }
// ...
```

**admin-backend** (`services/admin-backend/prisma/schema.prisma`):
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")     // admin_api_user credentials
  schemas  = ["public", "auth", "admin"]
}

// ALL tables from all 3 schemas
model Article { @@map("articles") @@schema("public") }
model User { @@map("users") @@schema("auth") }
model AdminLog { @@map("admin_logs") @@schema("admin") }
model MediaFile { @@map("media_files") @@schema("admin") }
// ...
```

### 6.5 Cross-Schema Foreign Keys

PostgreSQL supports cross-schema FKs natively:

| FK | Works? |
|----|--------|
| `public.articles.created_by` → `auth.users.id` | ✅ |
| `auth.saved_articles.article_id` → `public.articles.id` | ✅ |
| `admin.admin_logs.admin_id` → `auth.users.id` | ✅ |

---

## 7. Backend Architecture

### 7.1 user-backend (`services/user-backend/`)

**Express server on port 5000. Prisma for DB. Redis for cache. Socket.io for real-time.**

What changes from current `backend/`:
- Moved from `backend/` to `services/user-backend/`
- Remove `routes/admin.ts` (2,366 lines) + `routes/debug.ts`
- Clean `middleware/auth.ts` to JWT-only (remove base64 RBAC)
- Add `services/` directory for business logic (replaces Supabase `dbApi` functions)
- Add `socket/` directory for Socket.io event handlers
- Add `config/redis.ts` for Redis client
- Add `middleware/cache.ts` for Redis cache middleware
- Update Prisma schema: `public` + `auth` only, `multiSchema` directives
- `DATABASE_URL` → `user_api_user` credentials

#### New API Endpoints (Replacing Supabase Client Queries)

These endpoints replace what `src/lib/database.ts` (Supabase) was doing:

| Old (Supabase client) | New (user-backend API) | Redis Cache TTL |
|----------------------|----------------------|------------------|
| `dbApi.getArticles(limit, offset)` | `GET /api/articles?limit=20&offset=0` | 60s |
| `dbApi.getFeaturedArticles()` | `GET /api/articles/featured` | 120s |
| `dbApi.getArticleBySlug(slug)` | `GET /api/articles/:slug` | 300s |
| `dbApi.searchArticles(query)` | `GET /api/articles/search?q=query` | 30s |
| `dbApi.getCategories()` | `GET /api/categories` | 600s |
| `dbApi.getCategoryBySlug(slug)` | `GET /api/categories/:slug` | 600s |
| `dbApi.getArticlesByCategory(slug)` | `GET /api/categories/:slug/articles` | 60s |
| `dbApi.getTrendingArticles()` | `GET /api/articles/trending` | 120s |
| `dbApi.getPopularArticles()` | `GET /api/articles/popular` | 120s |

**Most of these endpoints already exist in `backend/src/routes/articles.ts` and `categories.ts`.** The Supabase client was a redundant parallel path. Some may need minor adjustments to match frontend expectations.

#### Full Component Status

| Component | Status |
|-----------|--------|
| Express + Helmet + Morgan + CORS + Compression | ✅ Same |
| Prisma client for DB queries | ✅ Same (now ONLY path to DB) |
| Redis caching | ✅ Enhanced (cache middleware for all read-heavy endpoints) |
| Socket.io real-time | ✅ Same (now also replaces Supabase real-time) |
| express-rate-limit | ✅ Same |
| Zod validation | ✅ Same |
| Multer file uploads | ✅ Same |
| errorHandler + requestLogger | ✅ Same |
| ts-node-dev for development | ✅ Same |

### 7.2 admin-backend (`services/admin-backend/`)

**Same tech stack as user-backend, plus OpenAI, Nodemailer, Lexical.**

The 2,366-line `admin.ts` split into modular route files:

| Route File | Extracted From |
|------------|----------------|
| `routes/auth.ts` | admin.ts login section |
| `routes/users.ts` | admin.ts user management (GET/PATCH/DELETE users, subscribers, team) |
| `routes/content.ts` | admin.ts article CRUD |
| `routes/categories.ts` | admin.ts category section |
| `routes/webstories.ts` | admin.ts webstory section |
| `routes/media.ts` | admin.ts media section |
| `routes/analytics.ts` | admin.ts analytics overview + realtime |
| `routes/moderation.ts` | admin.ts moderation queue, reports, spam |
| `routes/advertising.ts` | admin.ts ad requests + campaigns |
| `routes/newsletter.ts` | admin.ts newsletter templates |
| `routes/market-config.ts` | admin.ts market config |
| `routes/market.ts` | admin.ts market data |
| `routes/system.ts` | admin.ts system (security, integrations, backups) |
| `routes/site-config.ts` | admin.ts site config (public + admin) |
| `routes/stats.ts` | admin.ts dashboard stats |
| `routes/health.ts` | health check |

### 7.3 Auth Middleware Separation

**user-backend** (`services/user-backend/src/middleware/auth.ts`) — JWT only:
```typescript
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**admin-backend** (`services/admin-backend/src/middleware/auth.ts`) — RBAC only:
```typescript
export const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Admin token required' });

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const validRoles = ['SUPER_ADMIN','ADMIN','EDITOR','AUTHOR','MODERATOR','VIEWER'];
    if (!validRoles.includes(decoded.role))
      return res.status(403).json({ error: 'Invalid role' });

    const tokenAge = Date.now() - decoded.timestamp;
    if (tokenAge > 8 * 60 * 60 * 1000)
      return res.status(401).json({ error: 'Session expired' });

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      isAdmin: true,
      role: decoded.role,
      permissions: decoded.permissions || []
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};
```

---

## 8. Frontend Architecture

### 8.1 user-frontend (`apps/user-frontend/`)

**Next.js 15, React 19, Tailwind v4. ALL data fetched from user-backend API.**

| Aspect | Decision |
|--------|----------|
| Rendering | SSR/ISR — article pages, category desks |
| Styling | Tailwind v4 — editorial palette |
| Fonts | Playfair Display, Inter, JetBrains Mono |
| API calls | `NEXT_PUBLIC_API_URL` → `user-backend` |
| Real-time | Socket.io client → `user-backend` |
| Auth | JWT via `lib/auth.ts` |
| DB access | ❌ NONE — no Prisma, no Supabase, no direct connections |

**Packages REMOVED from user-frontend:**
- `@supabase/supabase-js` — deleted
- `@supabase/auth-helpers-nextjs` — deleted
- `prisma` CLI — not needed in frontend
- All 16 `@tiptap/*` packages — moved to admin-frontend
- `bcryptjs` — password hashing belongs in backend only

**Packages ADDED to user-frontend:**
- `socket.io-client` ^4.7.4 — for real-time WebSocket events

**Files DELETED from root src/ (Supabase):**
- `src/lib/database.ts` — Supabase client (replaced by API calls)
- `src/lib/database-real.ts` — Supabase variant
- `src/lib/database-mock.ts` — Supabase variant

**Files DELETED from root src/ (admin):**
- `src/lib/admin-client.ts`, `admin-jwt-bridge.ts`, `audit-logger.ts`, `get-admin-token.ts`, `rbac-auth.ts`, `secure-auth.ts`, `simple-admin-auth.ts`, `unified-admin-auth.ts`, `security.ts`
- `src/hooks/useAdminAuth.ts`, `useAdminToken.ts`, `useSecureAuth.ts`
- `src/contexts/AdminThemeContext.tsx`
- `src/config/rbac.ts`
- `src/components/AdminProtected.tsx`, `AdminLayoutContent.tsx`, `ConditionalLayout.tsx`, `UnifiedAdminGuard.tsx`, `SecureAdminGuard.tsx`, `SimpleAdminGuard.tsx`, `AdvancedNewsEditor.tsx`, `BeautifulEditor.tsx`, `SecureLoginForm.tsx`
- `src/app/admin/` (entire directory)

### 8.2 admin-frontend (`apps/admin-frontend/`)

**Next.js 15, React 19, Tailwind v4. Plus TipTap + Lexical. ALL data via admin-backend API.**

| Aspect | Decision |
|--------|----------|
| Rendering | CSR / SPA (no public SEO needed) |
| Styling | Tailwind v4 — admin palette |
| Fonts | Inter + JetBrains Mono |
| API calls | `NEXT_PUBLIC_ADMIN_API_URL` → `admin-backend` |
| Real-time | Socket.io client → `admin-backend` |
| Auth | RBAC token via `lib/admin-auth.ts` |
| URL scheme | No `/admin` prefix — pages at root (`/content`, `/analytics`, etc.) |
| DB access | ❌ NONE |

---

## 9. Real-time Strategy (Socket.io)

**Socket.io replaces Supabase real-time subscriptions entirely.**

### user-backend → user-frontend

| Event | Trigger | Data |
|-------|---------|------|
| `article:published` | New article published by admin | `{ id, title, slug, category, imageUrl }` |
| `article:updated` | Article content updated | `{ id, slug, updatedFields }` |
| `breaking:news` | Breaking news flag | `{ id, title, slug, priority }` |
| `comment:new` | New comment on article page | `{ articleId, comment }` |
| `market:update` | Market data refresh | `{ indices, crypto, currencies }` |
| `notification:user` | Personal notification | `{ userId, type, message }` |

### admin-backend → admin-frontend

| Event | Trigger | Data |
|-------|---------|------|
| `content:updated` | Article created/edited/deleted | `{ id, action, editor }` |
| `moderation:alert` | New report or flagged content | `{ reportId, type, severity }` |
| `user:activity` | User stats changed | `{ activeUsers, newSignups }` |
| `system:alert` | System health event | `{ type, message }` |

### Redis Pub/Sub for Cross-Service Events

When admin publishes an article via `admin-backend`, it needs to reach `user-backend` Socket.io clients:

```
admin-backend → Redis PUBLISH "article:published" → user-backend SUBSCRIBE → Socket.io emit to clients
```

This keeps services decoupled while enabling cross-service real-time.

---

## 10. Caching Strategy (Redis)

**Redis eliminates the need for direct frontend DB access. High-read data is served from cache with sub-millisecond latency.**

### Cache Architecture

```
user-frontend ──→ user-backend ──→ Redis Cache ──→ (cache HIT) ──→ Response
                                       │
                                       └── (cache MISS) ──→ Prisma ──→ PostgreSQL
                                                                  └──→ Write to Redis
```

### Cache Keys & TTLs

| Key Pattern | TTL | Invalidation |
|-------------|-----|--------------|
| `articles:list:{page}:{limit}` | 60s | On article publish/update |
| `articles:featured` | 120s | On featured flag change |
| `articles:trending` | 120s | Every 2 min refresh |
| `articles:popular` | 120s | Every 2 min refresh |
| `articles:slug:{slug}` | 300s | On article update |
| `articles:search:{query}` | 30s | Short TTL for freshness |
| `categories:all` | 600s | On category change |
| `categories:slug:{slug}` | 600s | On category update |
| `categories:{slug}:articles:{page}` | 60s | On article publish |
| `market:indices` | 30s | On market data refresh |
| `market:crypto` | 30s | On market data refresh |
| `market:currencies` | 60s | On market data refresh |
| `site:config:public` | 300s | On config change |
| `stats:site` | 120s | Periodic refresh |

### Cache Invalidation Strategy

1. **TTL-based** — Most caches auto-expire and refresh on next request
2. **Event-based** — When admin publishes/updates content via admin-backend, publish Redis event → user-backend subscriber clears relevant cache keys
3. **Manual** — Admin can trigger full cache flush via admin-backend `/api/system/cache/flush`

### Performance Comparison

| Operation | Before (Supabase direct) | After (Redis + Prisma) |
|-----------|------------------------|----------------------|
| Article list | ~80ms (Supabase → Neon) | ~2ms (Redis HIT) / ~40ms (Prisma MISS) |
| Featured articles | ~60ms | ~1ms / ~30ms |
| Category list | ~40ms | ~1ms / ~20ms |
| Search | ~120ms | ~3ms / ~60ms |
| Market data | ~50ms | ~1ms / ~25ms |

Redis is actually **faster** than Supabase client-side queries because cached data is served from memory, and it keeps the database connection secure on the server side.

---

## 11. Authentication Strategy

### Complete Separation

| Aspect | User Auth | Admin Auth |
|--------|-----------|------------|
| Token type | JWT (jsonwebtoken) | Base64 JSON (RBAC) |
| Storage key | `newsnerve_auth_token` | `newstrnt_admin_session` |
| Middleware | `jwt.verify()` | `Buffer.from().toString()` |
| Flow | user-frontend → user-backend | admin-frontend → admin-backend |
| DB access | `public` (SELECT), `auth` (R/W) | ALL schemas |

### Files Moved from Root to admin-frontend

| Original File | Action |
|---------------|--------|
| `src/lib/admin-jwt-bridge.ts` | MOVE → consolidated into `admin-frontend/src/lib/admin-auth.ts` |
| `src/lib/unified-admin-auth.ts` | MOVE → consolidated into above |
| `src/lib/get-admin-token.ts` | MOVE → consolidated into above |
| `src/lib/secure-auth.ts` | MOVE → `admin-frontend/src/lib/` |
| `src/lib/rbac-auth.ts` | MOVE → `admin-frontend/src/lib/` |
| `src/lib/admin-client.ts` | MOVE → `admin-frontend/src/lib/` |
| `src/lib/audit-logger.ts` | MOVE → `admin-frontend/src/lib/` |
| `src/lib/security.ts` | MOVE → `admin-frontend/src/lib/` |
| `src/hooks/useAdminAuth.ts` | MOVE → `admin-frontend/src/hooks/` |
| `src/hooks/useAdminToken.ts` | MOVE → `admin-frontend/src/hooks/` |
| `src/config/rbac.ts` | MOVE → `admin-frontend/src/config/` |
| `src/components/UnifiedAdminGuard.tsx` | MOVE → `admin-frontend/` as `AdminGuard.tsx` |

### Files Deleted (Legacy/Unused)

| File | Reason |
|------|--------|
| `src/lib/simple-admin-auth.ts` | Legacy, replaced |
| `src/lib/database.ts` | Supabase client — removed |
| `src/lib/database-real.ts` | Supabase variant — removed |
| `src/lib/database-mock.ts` | Supabase variant — removed |
| `src/hooks/useSecureAuth.ts` | Unused |
| `src/contexts/AdminThemeContext.tsx` | Empty file |
| `src/components/SecureAdminGuard.tsx` | Unused |
| `src/components/SimpleAdminGuard.tsx` | Unused |
| `src/components/AdminProtected.tsx` | Replaced by AdminGuard |
| `src/components/ConditionalLayout.tsx` | Unnecessary with split |

---

## 12. Environment Variable Strategy

### 12.1 user-frontend (`apps/user-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.newstrnt.com
NEXT_PUBLIC_WS_URL=wss://api.newstrnt.com
NEXT_PUBLIC_SITE_URL=https://newstrnt.com
NEXTAUTH_URL=https://newstrnt.com
NEXTAUTH_SECRET=<random-string>

# ❌ NEVER: DATABASE_URL, SUPABASE_*, ADMIN_*, OPENAI_API_KEY
```

### 12.2 user-backend (`services/user-backend/.env`)

```env
PORT=5000
NODE_ENV=production
CLIENT_URLS=https://newstrnt.com
DATABASE_URL=postgresql://user_api_user:<password>@<neon-host>/newstrnt?sslmode=require
JWT_SECRET=<user-jwt-secret>
REDIS_URL=redis://<redis-host>:6379

# ❌ NEVER: ADMIN_JWT_SECRET, OPENAI_API_KEY, SUPABASE_*
```

### 12.3 admin-frontend (`apps/admin-frontend/.env.local`)

```env
NEXT_PUBLIC_ADMIN_API_URL=https://admin-api.internal.newstrnt.com
NEXT_PUBLIC_ADMIN_WS_URL=wss://admin-api.internal.newstrnt.com

# ❌ NEVER: NEXT_PUBLIC_API_URL, DATABASE_URL, SUPABASE_*
```

### 12.4 admin-backend (`services/admin-backend/.env`)

```env
PORT=5002
NODE_ENV=production
CLIENT_URLS=https://admin.newstrnt.com
DATABASE_URL=postgresql://admin_api_user:<password>@<neon-host>/newstrnt?sslmode=require
ADMIN_JWT_SECRET=<admin-jwt-secret>
OPENAI_API_KEY=<key>
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
REDIS_URL=redis://<redis-host>:6379

# ❌ NEVER: JWT_SECRET (user), SUPABASE_*
```

### 12.5 Isolation Matrix

| Variable | user-frontend | user-backend | admin-frontend | admin-backend |
|----------|:---:|:---:|:---:|:---:|
| `DATABASE_URL` (user role) | ❌ | ✅ | ❌ | ❌ |
| `DATABASE_URL` (admin role) | ❌ | ❌ | ❌ | ✅ |
| `JWT_SECRET` | ❌ | ✅ | ❌ | ❌ |
| `ADMIN_JWT_SECRET` | ❌ | ❌ | ❌ | ✅ |
| `OPENAI_API_KEY` | ❌ | ❌ | ❌ | ✅ |
| `NEXTAUTH_SECRET` | ✅ | ❌ | ❌ | ❌ |
| `REDIS_URL` | ❌ | ✅ | ❌ | ✅ |
| `SMTP_*` | ❌ | ❌ | ❌ | ✅ |
| `SUPABASE_*` | ❌ | ❌ | ❌ | ❌ |

**Note: `SUPABASE_*` variables are ❌ across ALL services. Supabase is fully removed.**

---

## 13. Deployment Plan

### 13.1 Updated Docker Compose (6 services)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    networks: [newstrnt-network]

  redis:
    image: redis:7
    ports: ["6379:6379"]
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    networks: [newstrnt-network]

  user-backend:
    build: ./services/user-backend
    ports: ["5000:5000"]
    env_file: ./services/user-backend/.env
    depends_on: [postgres, redis]
    networks: [newstrnt-network]

  user-frontend:
    build: ./apps/user-frontend
    ports: ["3000:3000"]
    env_file: ./apps/user-frontend/.env.local
    depends_on: [user-backend]
    networks: [newstrnt-network]

  admin-backend:
    build: ./services/admin-backend
    ports: ["5002:5002"]
    env_file: ./services/admin-backend/.env
    depends_on: [postgres, redis]
    networks: [newstrnt-network, newstrnt-private]

  admin-frontend:
    build: ./apps/admin-frontend
    ports: ["3001:3001"]
    env_file: ./apps/admin-frontend/.env.local
    depends_on: [admin-backend]
    networks: [newstrnt-private]

  scraper:
    build: ./scraper-ai
    depends_on: [postgres]
    networks: [newstrnt-network]

volumes:
  postgres_data:

networks:
  newstrnt-network:
    driver: bridge
  newstrnt-private:
    driver: bridge
    internal: true
```

### 13.2 CI/CD — Per-service GitHub Actions with Path Filters

Each service deploys independently when its files change on master:
- `apps/user-frontend/**` → triggers `deploy-user-frontend.yml`
- `services/user-backend/**` → triggers `deploy-user-backend.yml`
- `apps/admin-frontend/**` → triggers `deploy-admin-frontend.yml`
- `services/admin-backend/**` → triggers `deploy-admin-backend.yml`

---

## 14. Migration Steps

### Phase 0: Preparation (1 day)
- [ ] Create feature branch `feat/system-isolation`
- [ ] Back up Neon database
- [ ] Tag current state as `v0.x-monolith`
- [ ] Create `services/` directory

### Phase 1: Database Schema Isolation (2–3 days)
- [ ] Run SQL migrations from `database/migrations/` on Neon staging branch
- [ ] Verify cross-schema FKs work
- [ ] Create roles, grant permissions
- [ ] Test: `user_api_user` blocked from `admin.*`

### Phase 2: Scaffold user-backend (2–3 days)
- [ ] Move `backend/` → `services/user-backend/`
- [ ] Remove `routes/admin.ts` (2,366 lines) + `routes/debug.ts`
- [ ] Clean auth middleware to JWT-only
- [ ] Add Redis cache middleware + service layer
- [ ] Add Socket.io event handlers
- [ ] Ensure all frontend-needed endpoints exist (articles, featured, search, categories)
- [ ] Update Prisma schema: `public` + `auth` only, `multiSchema`
- [ ] Switch `DATABASE_URL` to `user_api_user`

### Phase 3: Scaffold admin-backend (3–4 days)
- [ ] Create `services/admin-backend/` with same deps + OpenAI + Nodemailer + Lexical
- [ ] Split `admin.ts` (2,366 lines) into 15 route files
- [ ] Copy RBAC auth middleware (remove JWT handling)
- [ ] Add Redis cache + Socket.io
- [ ] Create Prisma schema (all 3 schemas)
- [ ] Test all admin endpoints

### Phase 4: Scaffold user-frontend (3–4 days)
- [ ] Move root Next.js app → `apps/user-frontend/`
- [ ] Delete `src/app/admin/` (entire directory)
- [ ] Delete admin components, hooks, libs, config
- [ ] Delete Supabase files: `database.ts`, `database-real.ts`, `database-mock.ts`
- [ ] Remove `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, TipTap from `package.json`
- [ ] Add `socket.io-client`
- [ ] Update all API calls to use `NEXT_PUBLIC_API_URL` (replace Supabase `dbApi.*` with fetch/axios)
- [ ] Simplify root `layout.tsx` — always Header + Footer
- [ ] Verify all reader pages render correctly

### Phase 5: Scaffold admin-frontend (3–4 days)
- [ ] Create `apps/admin-frontend/` with `npx create-next-app`
- [ ] Move admin pages from `src/app/admin/` (drop `/admin` prefix)
- [ ] Move admin components, hooks, libs
- [ ] Move TipTap deps
- [ ] Consolidate admin auth modules
- [ ] Add `socket.io-client`
- [ ] Test all admin pages

### Phase 6: Integration Testing (2–3 days)
- [ ] End-to-end flows: registration, article read, comments, saves
- [ ] Socket.io real-time events (breaking news, comments)
- [ ] Redis cache HIT/MISS verification
- [ ] Permission boundary verification (user can't access admin schema)
- [ ] Load testing

### Phase 7: Deployment & Cutover (2 days)
- [ ] Set up Vercel projects + backend hosts
- [ ] Configure DNS + GitHub Actions
- [ ] Blue-green deploy
- [ ] Monitor 48h

### Phase 8: Cleanup (1 day)
- [ ] Move leftover root files to `deprecated/`
- [ ] Update docs
- [ ] Delete old root `src/`, `package.json`, `next.config.js`, etc.

**Total: 20–26 days**

---

## 15. Production Security Checklist

- [ ] `user_api_user` has ZERO access to `admin` schema
- [ ] `user_api_user` has NO DELETE on `auth.users`
- [ ] Both DB passwords are 32+ chars, different from each other
- [ ] SSL on all DB connections
- [ ] No `@supabase/supabase-js` in any `package.json`
- [ ] No `SUPABASE_*` env vars in any `.env` file
- [ ] No direct frontend → database connections
- [ ] admin-backend not publicly accessible
- [ ] admin-frontend IP-restricted
- [ ] Admin domain returns `X-Robots-Tag: noindex, nofollow`
- [ ] User JWT secret ≠ Admin JWT secret
- [ ] No env overlap between user and admin services
- [ ] user-backend auth rejects non-JWT tokens
- [ ] admin-backend auth rejects JWT tokens
- [ ] CORS scoped per service
- [ ] Rate limiting on both backends
- [ ] Redis `maxmemory-policy allkeys-lru` configured
- [ ] Docker `newstrnt-private` set to `internal: true`
- [ ] No `.env` files in Git
- [ ] Independent health checks + error tracking per service

---

## 16. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema migration breaks FKs | Data loss | Test on Neon branch first |
| Moving root Next.js app to `apps/user-frontend/` | Build path errors | Update all relative paths, test build |
| Frontend needs endpoint that doesn't exist yet | Broken pages | Audit all Supabase `dbApi.*` calls, map each to backend endpoint |
| Prisma `multiSchema` instability | Build errors | Pin version; fallback to raw SQL |
| Redis cache stale data | User sees old content | TTL-based auto-refresh + event-based invalidation |
| Socket.io connection drops | No real-time updates | Auto-reconnect with exponential backoff |
| Code duplication drift | Maintenance burden | Accept; keep copies minimal |
| Feature freeze during migration | Business impact | Phase-based migration; hotfix on old system |

---

## 17. Phase Timeline & Milestones

```
Week 1  ├── Phase 0: Preparation + services/ directory
        ├── Phase 1: Database Schema Isolation
        └── Phase 2: Scaffold user-backend (start)

Week 2  ├── Phase 2: Complete user-backend
        └── Phase 3: Scaffold admin-backend

Week 3  ├── Phase 4: Scaffold user-frontend (remove Supabase, move to services/)
        └── Phase 5: Scaffold admin-frontend

Week 4  ├── Phase 6: Integration Testing
        ├── Phase 7: Deployment
        └── Phase 8: Cleanup
```

| Milestone | Target |
|-----------|--------|
| **M1: DB Isolated** — schemas, roles, permissions | End Week 1 |
| **M2: user-backend running** — all reader endpoints + Redis cache + Socket.io | End Week 2 |
| **M3: admin-backend running** — all admin endpoints | End Week 2 |
| **M4: user-frontend clean** — no Supabase, no admin code, API-only | End Week 3 |
| **M5: admin-frontend live** — independent admin CMS app | End Week 3 |
| **M6: Cutover complete** — DNS switched, monitoring green | End Week 4 |

---

## Appendix A: Complete Table → Schema Mapping

| # | Table | Target Schema | user_api_user | admin_api_user |
|---|-------|--------------|---------------|----------------|
| 1 | `articles` | `public` | SELECT | ALL |
| 2 | `categories` | `public` | SELECT | ALL |
| 3 | `subcategories` | `public` | SELECT | ALL |
| 4 | `tags` | `public` | SELECT | ALL |
| 5 | `article_tags` | `public` | SELECT | ALL |
| 6 | `web_stories` | `public` | SELECT | ALL |
| 7 | `comments` | `public` | SELECT, INSERT, UPDATE | ALL |
| 8–15 | `market_*`, `crypto_*`, `currency_*`, `commodity_*` | `public` | SELECT | ALL |
| 16 | `site_config` | `public` | SELECT | ALL |
| 17 | `users` | `auth` | SELECT, INSERT, UPDATE | ALL |
| 18 | `saved_articles` | `auth` | SEL, INS, UPD, DEL | ALL |
| 19 | `reading_history` | `auth` | SELECT, INSERT, UPDATE | ALL |
| 20 | `user_interactions` | `auth` | SELECT, INSERT, UPDATE | ALL |
| 21 | `newsletter_subscriptions` | `auth` | SELECT, INSERT, UPDATE | ALL |
| 22 | `push_tokens` | `auth` | SELECT, INSERT, UPDATE | ALL |
| 23 | `category_follows` | `auth` | SEL, INS, UPD, DEL | ALL |
| 24 | `topic_follows` | `auth` | SEL, INS, UPD, DEL | ALL |
| 25–43 | `admin_logs`, `analytics_events`, `email_templates`, `system_backups`, `ad_requests`, `ad_campaigns`, `integrations`, `spam_rules`, `security_events`, `media_files`, `moderation_reports`, `system_settings`, `team_invites`, `scraper_runs`, `market_*_configs`, `currency_pair_configs`, `market_provider_preferences` | `admin` | ❌ NONE | ALL |

---

## Appendix B: Supabase → Backend API Migration Map

Every function from `src/lib/database.ts` (Supabase client) and its replacement:

| Supabase Function | New Backend Endpoint | Cache | Notes |
|-------------------|---------------------|-------|-------|
| `dbApi.getArticles(limit, offset)` | `GET /api/articles?limit=20&offset=0` | Redis 60s | Already exists in articles.ts |
| `dbApi.getFeaturedArticles()` | `GET /api/articles/featured` | Redis 120s | Already exists |
| `dbApi.getArticleBySlug(slug)` | `GET /api/articles/:slug` | Redis 300s | Already exists |
| `dbApi.searchArticles(query)` | `GET /api/articles/search?q=query` | Redis 30s | May need enhancement |
| `dbApi.getCategories()` | `GET /api/categories` | Redis 600s | Already exists |
| `dbApi.getCategoryBySlug(slug)` | `GET /api/categories/:slug` | Redis 600s | Already exists |
| `dbApi.getArticlesByCategory(slug, limit)` | `GET /api/categories/:slug/articles` | Redis 60s | Already exists |
| `dbApi.getTrendingArticles()` | `GET /api/articles/trending` | Redis 120s | Already exists |
| `dbApi.getPopularArticles()` | `GET /api/articles/popular` | Redis 120s | May need new endpoint |
| `supabase.from('articles').select(...)` | Use `api-client.ts` fetch | — | All ad-hoc queries replaced |
