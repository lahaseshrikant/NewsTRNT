# NewsTRNT Documentation

All project documentation, organized by domain.

---

## Getting Started

| Document | Description |
|----------|-------------|
| [QUICK_START.md](getting-started/QUICK_START.md) | Quick start guide |
| [CONFIGURATION.md](getting-started/CONFIGURATION.md) | Environment variables and site config |
| [DATABASE_SETUP.md](getting-started/DATABASE_SETUP.md) | Database setup (Supabase / Neon) |
| [NEON_SETUP.md](getting-started/NEON_SETUP.md) | Neon PostgreSQL setup guide |

## Architecture

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Hybrid API architecture overview |
| [SERVICE_ARCHITECTURE.md](architecture/SERVICE_ARCHITECTURE.md) | Inter-service communication and deployment |
| [ADMIN_MANAGEMENT_ARCHITECTURE.md](architecture/ADMIN_MANAGEMENT_ARCHITECTURE.md) | Admin & role management system |
| [ADMIN_USER_MODULE_SEPARATION.md](architecture/ADMIN_USER_MODULE_SEPARATION.md) | Admin vs user module isolation RFC |
| [ENTERPRISE_MODULE_ISOLATION.md](architecture/ENTERPRISE_MODULE_ISOLATION.md) | Enterprise-grade module isolation |
| [SCALABLE_STRATEGY.md](architecture/SCALABLE_STRATEGY.md) | Scalable implementation strategy |
| [SCALING_STRATEGY.md](architecture/SCALING_STRATEGY.md) | Free-to-premium migration scaling |

## API

| Document | Description |
|----------|-------------|
| [API-REFERENCE.md](api/API-REFERENCE.md) | Complete API endpoint reference |

## Security

| Document | Description |
|----------|-------------|
| [SECURITY.md](security/SECURITY.md) | Authentication system and security layers |
| [SCHEMA_SECURITY.md](security/SCHEMA_SECURITY.md) | Database schema security |
| [SECURITY-ANALYSIS.md](security/SECURITY-ANALYSIS.md) | Schema visibility risk assessment |
| [SECURITY-CLARIFICATION.md](security/SECURITY-CLARIFICATION.md) | Implementation clarifications |

## Database

| Document | Description |
|----------|-------------|
| [DATABASE-CACHING-STRATEGY.md](database/DATABASE-CACHING-STRATEGY.md) | Caching strategy |
| [DATABASE-CONFIG-MIGRATION.md](database/DATABASE-CONFIG-MIGRATION.md) | Config migration guide |

## Admin

| Document | Description |
|----------|-------------|
| [ADMIN_PORTAL.md](admin/ADMIN_PORTAL.md) | Admin portal management guide |

## Design

| Document | Description |
|----------|-------------|
| [CREATIVE_DIRECTION.md](design/CREATIVE_DIRECTION.md) | Brand identity, typography, and creative direction |

## Deployment

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_PLAN.md](deployment/DEPLOYMENT_PLAN.md) | Production deployment plan |

## Performance

| Document | Description |
|----------|-------------|
| [performance-optimization.md](performance/performance-optimization.md) | Optimization techniques |
| [performance-testing-guide.md](performance/performance-testing-guide.md) | Testing methodology |
| [EFFICIENCY_COST_ANALYSIS.md](performance/EFFICIENCY_COST_ANALYSIS.md) | Cost/efficiency analysis |

## Features

Active feature documentation — see [features/](features/):

- Advanced Editor (guide + implementation)
- Auth Routes Migration
- Content Type Enhancement
- Dynamic Category Solution
- Market Data (feature, implementation, quick-start, setup)
- News vs Articles (strategy + implementation)
- Feature Brainstorm

## Planning

| Document | Description |
|----------|-------------|
| [TODO.md](planning/TODO.md) | Task backlog |
| [MILESTONES.md](planning/MILESTONES.md) | Project milestones |
| [PROJECT_STATUS.md](planning/PROJECT_STATUS.md) | Current development status |
| [BRAINSTORM_CONTENT_ENGINE.md](planning/BRAINSTORM_CONTENT_ENGINE.md) | Content Engine brainstorm |
| [TESTING_CHECKLIST.md](planning/TESTING_CHECKLIST.md) | Testing and verification checklist |

## Deprecated

Historical fix logs, completion reports, and superseded component docs archived in [deprecated/](deprecated/).

---

## Folder Structure

```
docs/
├── README.md
├── getting-started/    # Setup & configuration
├── architecture/       # System design & scaling
├── api/                # API reference
├── security/           # Auth & schema security
├── database/           # DB caching & migration
├── admin/              # Admin portal docs
├── design/             # Brand & creative direction
├── deployment/         # Production deployment
├── performance/        # Optimization & testing
├── features/           # Active feature docs
├── planning/           # Milestones, TODOs, status
└── deprecated/         # Archived fix logs & old docs
    └── features/       # Completed implementation logs
```

## Quick Links

- [Main README](../README.md) — Project overview
- [Content Engine](../services/content-engine/) — Scraping & AI service
- [Admin Backend](../services/admin-backend/) — Admin API
- [User Backend](../services/user-backend/) — User API
- [Admin Frontend](../apps/admin-frontend/) — Admin dashboard
- [User Frontend](../apps/user-frontend/) — Public site

---

*Last updated: February 2026*
