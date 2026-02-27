# 🏗️ NewsTRNT Platform — Service Architecture

> Complete inter-service communication guide and deployment reference

---

## Service Overview

| Service | Port | Tech | Purpose |
|---------|------|------|---------|
| **User Frontend** | 3000 | Next.js 14 | Public-facing news reader, profiles, saved articles |
| **User Backend** | 5000 | Express/TS | User auth, article reads, comments, reading history |
| **Admin Frontend** | 3001 | Next.js 14 | Content management, analytics, system admin |
| **Admin Backend** | 5002 | Express/TS | Article CRUD, market data, categories, RBAC, uploads |
| **Content Engine** | 8000 | FastAPI/Py | Scraping, AI processing, scheduling, content delivery |
| **PostgreSQL** | 5432 | Neon | Shared database (Prisma ORM in Node services) |

---

## Communication Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        INTERNET / USERS                          │
└────────────────┬──────────────────────────────┬──────────────────┘
                 │                              │
                 ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   User Frontend (3000)  │    │  Admin Frontend (3001)  │
│   Next.js · Public      │    │  Next.js · Admin Only   │
│                         │    │                         │
│  • News feed            │    │  • Content management   │
│  • Article reader       │    │  • Market data config   │
│  • User profiles        │    │  • Content Engine UI    │
│  • Search & filters     │    │  • Analytics dashboard  │
│  • Saved articles       │    │  • System settings      │
└─────────┬───────────────┘    └───────────┬─────────────┘
          │ fetch()                        │ fetch()
          ▼                                ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│  User Backend (5000)    │    │  Admin Backend (5002)   │
│  Express · TypeScript   │    │  Express · TypeScript   │
│                         │    │                         │
│  • JWT auth (users)     │    │  • JWT auth (admins)    │
│  • GET articles         │    │  • Article CRUD         │
│  • Comments / history   │    │  • Category management  │
│  • User preferences     │    │  • Market data live     │
│  • Category follows     │    │  • WebStories          │
│                         │    │  • Content Engine proxy │
└─────────┬───────────────┘    └─────┬──────────┬────────┘
          │                          │          │
          │  Prisma                  │ Prisma   │ HTTP proxy
          │                          │          │ /api/content-engine/*
          ▼                          ▼          ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   Neon PostgreSQL       │    │  Content Engine (8000)  │
│                         │    │  FastAPI · Python 3.11  │
│  schemas:               │    │                         │
│  • public (articles,    │    │  • RSS + NewsAPI scrape │
│    users, categories,   │    │  • TradingView market   │
│    comments, tags)      │    │  • AI summarization     │
│  • admin (admins,       │    │  • Classification       │
│    roles, permissions,  │    │  • Sentiment analysis   │
│    system_settings,     │    │  • SEO optimization     │
│    scraper_runs)        │    │  • APScheduler jobs     │
└─────────────────────────┘    │  • Pipeline orchestrate │
                               └──────────┬──────────────┘
                                          │
                    ┌─────────────────────┼──────────────────┐
                    ▼                     ▼                  ▼
              RSS Feeds            NewsAPI.org          TradingView
              (10+ sources)        (headlines)          (indices)
```

---

## Auth Flow

### User Authentication

```
User Frontend → POST /api/auth/login → User Backend
                                         │
                                    JWT generated
                                         │
                                    ◄── Bearer token
                                         │
Subsequent requests:  Authorization: Bearer <jwt>
```

### Admin Authentication

```
Admin Frontend → POST /api/auth/admin/login → Admin Backend
                                                │
                                           JWT generated (RBAC)
                                                │
                                           ◄── Bearer token
                                                │
Subsequent requests:  Authorization: Bearer <jwt>
```

### Content Engine Authentication

```
1. Admin Frontend → Admin Backend (JWT) → Content Engine (API Key)
   /api/content-engine/* proxied with X-API-Key header

2. Content Engine → Admin Backend (Bearer key)
   POST /api/articles/ingest  →  Authorization: Bearer <CONTENT_ENGINE_API_KEY>
   POST /api/market/ingest    →  Authorization: Bearer <MARKET_INGEST_API_KEY>
```

---

## Inter-Service Communication

### Content Engine → Admin Backend

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/articles/ingest` | POST | Deliver AI-processed articles | `Bearer CONTENT_ENGINE_API_KEY` |
| `/api/market/ingest` | POST | Deliver market data | `Bearer CONTENT_ENGINE_API_KEY` |
| `/api/health` | GET | Connectivity check | None |

**Article Ingest Payload:**
```json
{
  "articles": [
    {
      "title": "Breaking: ...",
      "content": "<p>Full article HTML</p>",
      "summary": "AI-generated 100-word summary",
      "shortContent": "60-word short summary",
      "sourceUrl": "https://original-source.com/article",
      "sourceName": "Reuters",
      "imageUrl": "https://...",
      "category": "politics",
      "tags": ["election", "congress"],
      "sentiment": { "label": "neutral", "score": 0.52 },
      "seoTitle": "Optimized SEO Title",
      "seoDescription": "Meta description under 160 chars",
      "seoKeywords": ["keyword1", "keyword2"],
      "publishedAt": "2024-01-15T10:30:00Z",
      "priority": "normal"
    }
  ],
  "pipelineRunId": "run-abc-123"
}
```

**Market Ingest Payload:**
```json
{
  "scraperName": "content-engine",
  "dataType": "indices",
  "items": [
    {
      "symbol": "SPX",
      "name": "S&P 500",
      "last": 5234.18,
      "change": 15.29,
      "change_percent": 0.29,
      "high": 5240.00,
      "low": 5210.50,
      "country": "US",
      "currency": "USD"
    }
  ]
}
```

### Admin Backend → Content Engine (Proxy)

The admin-frontend communicates with the Content Engine through the admin-backend
proxy at `/api/content-engine/*`. This ensures:
- All requests are admin-authenticated (JWT)
- CORS is handled by admin-backend
- API keys are server-side only

| Admin Backend Route | Proxied To |
|---------------------|------------|
| `GET /api/content-engine/health` | `GET /api/v1/health` |
| `POST /api/content-engine/pipeline/trigger` | `POST /api/v1/pipeline/trigger` |
| `GET /api/content-engine/pipeline/history` | `GET /api/v1/pipeline/history` |
| `GET /api/content-engine/scheduler/status` | `GET /api/v1/scheduler/status` |
| `GET /api/content-engine/scraping/sources` | `GET /api/v1/scraping/sources` |
| `GET /api/content-engine/ai/status` | `GET /api/v1/ai/status` |
| `GET /api/content-engine/config` | `GET /api/v1/config` |

---

## Database Schema Summary

### Public Schema (shared by all services)

| Table | Primary Service | Purpose |
|-------|----------------|---------|
| `users` | User Backend | User accounts, profiles |
| `articles` | Admin Backend | All news content |
| `categories` | Admin Backend | Content categories |
| `sub_categories` | Admin Backend | Nested categories |
| `tags` | Admin Backend | Article tags |
| `article_tags` | Admin Backend | Article-tag relations |
| `comments` | User Backend | User comments |
| `saved_articles` | User Backend | Bookmarked articles |
| `reading_history` | User Backend | Article view tracking |
| `user_interactions` | User Backend | Likes, shares |
| `category_follows` | User Backend | Category subscriptions |
| `web_stories` | Admin Backend | Vertical stories |

### Admin Schema (admin-backend only)

| Table | Purpose |
|-------|---------|
| `admin_accounts` | Admin user accounts |
| `admin_roles` | RBAC roles |
| `admin_permissions` | Granular permissions |
| `admin_role_permissions` | Role-permission mapping |
| `system_settings` | Global config (maintenance, etc.) |
| `market_indices` | Live stock index data |
| `cryptocurrencies` | Crypto prices |
| `currency_rates` | Forex rates |
| `commodities` | Commodity prices |
| `market_index_config` | Admin market config |
| `scraper_runs` | Pipeline execution logs |

---

## Environment Variables Reference

### Admin Backend (.env)

```env
# Core
PORT=5002
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
ADMIN_CLIENT_URL=http://localhost:3001

# Content Engine Integration
CONTENT_ENGINE_API_KEY=shared-secret-key
CONTENT_ENGINE_URL=http://localhost:8000
MARKET_INGEST_API_KEY=shared-secret-key
```

### Content Engine (.env)

```env
# Core
ENGINE_PORT=8000
ENGINE_API_KEY=your-engine-api-key
ENGINE_ENV=development

# Admin Backend
ADMIN_BACKEND_URL=http://localhost:5002
CONTENT_ENGINE_API_KEY=shared-secret-key   # Must match admin-backend!

# AI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-3.5-turbo

# Sources
NEWS_API_KEY=your-newsapi-key

# Scheduler
ENABLE_SCHEDULER=true
NEWS_INTERVAL_MINUTES=30
MARKET_INTERVAL_MINUTES=15
```

---

## Deployment

### Development (local)

```bash
# Terminal 1: User Backend
cd services/user-backend && npm run dev

# Terminal 2: Admin Backend
cd services/admin-backend && npm run dev

# Terminal 3: Content Engine
cd services/content-engine && python main.py

# Terminal 4: User Frontend
cd apps/user-frontend && npm run dev

# Terminal 5: Admin Frontend
cd apps/admin-frontend && npm run dev
```

### Docker Compose (production)

```yaml
version: '3.8'
services:
  user-frontend:
    build: ./apps/user-frontend
    ports: ["3000:3000"]
    
  admin-frontend:
    build: ./apps/admin-frontend
    ports: ["3001:3001"]
    
  user-backend:
    build: ./services/user-backend
    ports: ["5000:5000"]
    env_file: ./services/user-backend/.env
    
  admin-backend:
    build: ./services/admin-backend
    ports: ["5002:5002"]
    env_file: ./services/admin-backend/.env
    
  content-engine:
    build: ./services/content-engine
    ports: ["8000:8000"]
    env_file: ./services/content-engine/.env
```

---

## Monitoring

- **Health checks**:
  - User Backend: `GET http://localhost:5000/api/health`
  - Admin Backend: `GET http://localhost:5002/api/health`
  - Content Engine: `GET http://localhost:8000/api/v1/health`

- **Content Engine Dashboard**: Admin Frontend → `/content-engine`
  - Service status, pipeline runs, scheduler, ingest history

- **Scraper Run Logs**: Stored in `admin.scraper_runs` table
  - `GET /api/articles/ingest/stats` for article ingestion runs
  - `GET /api/market/ingest/stats` for market data runs
