# Legacy Monolith Code (Archived)

> **This code is archived for reference only. It is NOT used in the current application.**

This directory contains the original monolith version of the NewsTRNT platform before it was refactored into the multi-service architecture.

## Current Architecture

The platform now uses a proper service-oriented structure:

```
apps/
  admin-frontend/   → Next.js admin dashboard (port 3001)
  user-frontend/    → Next.js user-facing app (port 3000)
services/
  admin-backend/    → Express admin API (port 5001)
  user-backend/     → Express user API (port 5000)
```

## What's in this Archive

| Folder       | Description                                           |
|-------------|-------------------------------------------------------|
| `src/`       | Old monolith Next.js frontend (combined admin + user) |
| `backend/`   | Old monolith Express backend (combined admin + user)  |
| `database/`  | Old raw SQL migration scripts                         |
| `deprecated/`| Previously deprecated files and debug scripts         |
| `data/`      | Static seed data (JSON files)                         |
| `portfolio/` | Portfolio documentation                               |

## Why Archived

- Admin and user logic were mixed in a single codebase
- Authentication was partially client-side (localStorage)
- No proper RBAC — roles/permissions were hardcoded in frontend
- Mock data mixed with production code
- Unprofessional file naming (`database-real.ts`, `simple-admin-auth.ts`)
- Security concerns with frontend-side auth validation

## Do NOT

- Import from this directory in production code
- Copy patterns from this code without review
- Run any of these files directly

---

*Archived on February 2026 during the v2 architecture migration.*
