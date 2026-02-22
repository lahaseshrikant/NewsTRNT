# NewsTRNT Copilot Instructions

<!-- Repo‑wide guidance for Copilot and other AI assistants -->

## What’s in this workspace

NewsTRNT is a multi‑service news platform built around three main subsystems:

1. **User-facing** – Next.js 14+ front end (`apps/user-frontend`) paired with an Express/TS API (`services/user-backend`).
2. **Admin tools** – separate Next.js dashboard (`apps/admin-frontend`) and Express/TS API (`services/admin-backend`) for content management, analytics, market data, and configuration.
3. **Content Engine** – a standalone FastAPI Python microservice (`services/content-engine`) that scrapes RSS/NewsAPI/TradingView, processes articles with OpenAI, schedules workflows, and delivers content to the admin backend.

The database is a shared Neon/PostgreSQL instance using Prisma in the Node services. Each service owns its own `package.json`/`requirements.txt` and installs dependencies locally; ignore the extraneous root `node_modules` and `.venv`.

## Architecture highlights

- Frontends: Next.js with App Router, TypeScript, Tailwind, monorepo structure.
- Backends: Express + TypeScript (admin & user) with JWT auth, Prisma ORM.
- Content Engine: FastAPI 2.0, Python 3.11, APScheduler, aiohttp, OpenAI.
- Inter-service auth: admin JWTs for UI → backend; API keys (Bearer) for backend ↔ content engine.
- Scheduler, pipeline, AI, and delivery modules live inside `services/content-engine`.

## Existing functionality (no need to reimplement)

- Scraping of news & market data (RSS, NewsAPI, TradingView).
- Article summarization, classification, sentiment, SEO, deduplication.
- Delivery endpoints in admin backend consume both articles and market feeds.
- Admin frontend contains Content Engine dashboard with health, pipeline, scheduler, sources, and AI pages.
- User frontend features personalized feed, trending, market ticker, reading progress bar, quick‑action cards, etc.

## Coding notes

- Use TypeScript across all JS/Node code. Lean on `any` only when necessary.
- Keep Tailwind utility classes expressive; reuse components under `src/components`.
- Python code uses Pydantic models and `@lru_cache` for config.
- For new features in Content Engine, update README and add routes under `api/*` with router setters in `main.py`.

## Contribution pointers

- Add new API routes to both the service and the admin‑backend proxy if they’ll be exposed via admin UI.
- Always update environment variable explanations in `services/content-engine/README.md` and the `.env.example` files.
- Use the existing `dbApi` client in frontends for safe backend access.
- Watch for RBAC requirements via `apps/admin-frontend/src/config/rbac.ts`.

## Cleaning up

- The `.github/copilot-instructions.md` file now holds this current summary and should be kept in sync with major architectural changes.

## When in doubt

Ask Copilot to search within this workspace, or open the relevant service folder and look for patterns (e.g. `grep "router.get" -R services/content-engine/api`).

Happy hacking!

