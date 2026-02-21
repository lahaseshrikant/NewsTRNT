# 🤖 Content Engine — NewsTRNT's AI-Powered Content Pipeline

> **Version 2.0.0** · FastAPI · Python 3.11 · Port 8000

The **Content Engine** is the brain of the NewsTRNT platform — a persistent FastAPI
microservice that handles news scraping, AI summarization, topic classification,
SEO optimization, market data collection, sentiment analysis, and automated delivery
to the admin-backend.

---

## 🚀 Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment config
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux
# → Edit .env with your API keys (see Environment Variables below)

# 4. Run the server
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Visit http://localhost:8000/docs for Swagger UI.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Admin Frontend  │────▶│    Admin Backend (5002)   │◄────│  User Backend   │
│   (3001)         │     │                          │     │   (5000)        │
└─────────────────┘     └──────┬───────────────┬───┘     └─────────────────┘
                               │               │
                     API proxy │        ingest  │
                               ▼               ▼
                     ┌──────────────────────────┐
                     │   Content Engine (8000)   │
                     │                          │
                     │  ┌─────────┐ ┌────────┐  │
                     │  │Scraping │→│ Dedup  │  │
                     │  └────┬────┘ └───┬────┘  │
                     │       │          │       │
                     │       ▼          ▼       │
                     │  ┌─────────────────────┐ │
                     │  │   AI Processing     │ │
                     │  │ Summarize│Classify│  │ │
                     │  │ Sentiment│SEO     │  │ │
                     │  └────────┬──────────┘  │
                     │           │              │
                     │           ▼              │
                     │  ┌─────────────────────┐ │
                     │  │ Delivery Service    │─┼──▶ Admin Backend
                     │  │ POST /articles/ingest│ │     /api/articles/ingest
                     │  │ POST /market/ingest  │ │     /api/market/ingest
                     │  └─────────────────────┘ │
                     │                          │
                     │  ┌─────────────────────┐ │
                     │  │ APScheduler         │ │
                     │  │  news: every 30min  │ │
                     │  │  market: every 15min│ │
                     │  └─────────────────────┘ │
                     └──────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        RSS Feeds         NewsAPI.org      TradingView
        (10+ sources)     (top headlines)  (indices)
```

### Key Design Decisions

- **No direct DB writes** — all persistence goes through admin-backend HTTP API
- **Pipeline orchestration** — scrape → dedup → AI enrich → deliver stages
- **Dual auth** — API key for service-to-service, JWT proxy for admin-frontend
- **Graceful fallbacks** — every AI function degrades to heuristic if OpenAI is down
- **Run tracking** — every pipeline execution is logged with per-stage metrics

---

## 📡 API Reference

Base URL: `http://localhost:8000/api/v1`

### Health & Status

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Basic health check |
| `GET` | `/health/status` | Key | Detailed service status, uptime, scheduler state |

### Pipeline

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/pipeline/trigger` | Key | Trigger pipeline run (`{ type: 'full'\|'news'\|'market' }`) |
| `GET` | `/pipeline/history` | Key | Recent pipeline runs (accepts `?limit=N`) |
| `GET` | `/pipeline/runs/{run_id}` | Key | Get specific run detail with stages |

### Scraping

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/scraping/sources` | Key | List all configured scraping sources |
| `POST` | `/scraping/rss` | Key | Trigger RSS feed scrape |
| `POST` | `/scraping/newsapi` | Key | Trigger NewsAPI fetch |
| `POST` | `/scraping/market` | Key | Trigger TradingView market scrape |

### AI Processing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/ai/status` | Key | AI provider health & model info |
| `POST` | `/ai/summarize` | Key | Summarize article content |
| `POST` | `/ai/classify` | Key | Classify article into categories |
| `POST` | `/ai/sentiment` | Key | Analyze article sentiment |
| `POST` | `/ai/seo-optimize` | Key | Generate SEO metadata |
| `POST` | `/ai/process` | Key | Full AI pipeline (all of the above) |

### Scheduler

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/scheduler/status` | Key | Scheduler state, jobs list |
| `POST` | `/scheduler/jobs` | Key | Create a new scheduled job |
| `PATCH` | `/scheduler/jobs/{id}` | Key | Pause/resume/update job |
| `DELETE` | `/scheduler/jobs/{id}` | Key | Remove a scheduled job |

### Configuration

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/config` | Key | Current runtime configuration |
| `PATCH` | `/config` | Key | Update runtime settings |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENGINE_PORT` | No | `8000` | Server port |
| `ENGINE_HOST` | No | `0.0.0.0` | Bind address |
| `ENGINE_API_KEY` | **Yes** | — | API key for incoming requests |
| `ENGINE_ENV` | No | `development` | Environment (development/production) |
| `ENGINE_LOG_LEVEL` | No | `INFO` | Log level (DEBUG/INFO/WARNING/ERROR) |
| `ENGINE_WORKERS` | No | `1` | Uvicorn worker count |
| `ADMIN_BACKEND_URL` | **Yes** | `http://localhost:5002` | Admin backend base URL |
| `CONTENT_ENGINE_API_KEY` | **Yes** | — | Shared key for article delivery auth |
| `MARKET_INGEST_API_KEY` | No | — | Shared key for market data delivery |
| `OPENAI_API_KEY` | **Yes** | — | OpenAI API key |
| `AI_MODEL` | No | `gpt-3.5-turbo` | OpenAI model to use |
| `AI_MAX_TOKENS` | No | `4096` | Max tokens per AI request |
| `AI_TEMPERATURE` | No | `0.3` | AI temperature (0-1) |
| `NEWS_API_KEY` | No | — | NewsAPI.org API key |
| `NEWS_INTERVAL_MINUTES` | No | `30` | Auto-scrape news interval |
| `MARKET_INTERVAL_MINUTES` | No | `15` | Auto-scrape market interval |
| `MAX_ARTICLES_PER_RUN` | No | `50` | Max articles per pipeline run |
| `ENABLE_SCHEDULER` | No | `true` | Enable automatic task scheduling |
| `DEFAULT_TIMEZONE` | No | `UTC` | Scheduler timezone |
| `REDIS_URL` | No | — | Redis URL (optional caching) |

---

## 📁 Project Structure

```
content-engine/
├── main.py                      # FastAPI app entry point + lifespan
├── config.py                    # Pydantic-settings configuration
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Production container
├── .env.example                 # Environment template
├── README.md                    # This file
│
├── api/                         # Route handlers
│   ├── health.py                # GET /health, /health/status
│   ├── scraping.py              # Scraping trigger endpoints
│   ├── ai_processing.py         # AI processing endpoints
│   ├── scheduler_routes.py      # Scheduler management
│   ├── pipeline_routes.py       # Pipeline trigger & history
│   └── config_routes.py         # Runtime config
│
├── core/                        # Business logic
│   ├── pipeline.py              # PipelineOrchestrator (main orchestration)
│   ├── delivery.py              # HTTP delivery to admin-backend
│   └── deduplication.py         # Article dedup (MD5 + file cache)
│
├── scraping/                    # Data collection
│   ├── base.py                  # BaseScraper ABC + helpers
│   ├── rss_scraper.py           # RSS feed aggregator (10+ sources)
│   ├── newsapi_scraper.py       # NewsAPI.org client
│   └── tradingview_scraper.py   # TradingView market scraper
│
├── ai/                          # AI enrichment
│   ├── provider.py              # Centralized OpenAI client
│   ├── summarizer.py            # Article summarization
│   ├── classifier.py            # Topic classification (12 categories)
│   ├── seo_optimizer.py         # SEO analysis (zero API cost)
│   └── sentiment.py             # Sentiment analysis
│
├── scheduler/                   # Task scheduling
│   └── manager.py               # APScheduler wrapper + job CRUD
│
├── models/                      # Pydantic data models
│   ├── article.py               # Article lifecycle models
│   ├── market.py                # Market data models
│   ├── pipeline.py              # Pipeline run tracking
│   └── responses.py             # Standard API responses
│
├── middleware/                   # Request processing
│   ├── auth.py                  # API key verification
│   ├── logging_mw.py            # Request/response logging
│   └── rate_limit.py            # Token-bucket rate limiter
│
├── utils/                       # Shared utilities
│   ├── http_client.py           # Async HTTP client
│   └── text_processing.py       # Text cleaning helpers
│
└── data/                        # Runtime data (gitignored)
    └── seen_hashes.json         # Deduplication cache
```

---

## 🔄 Pipeline Flow

```
1. SCRAPE     RSS Feeds + NewsAPI → raw articles
                   ↓
2. DEDUP      MD5(title) → filter seen articles
                   ↓
3. AI ENRICH  Summarize + Classify + Sentiment + SEO
                   ↓
4. DELIVER    POST articles to admin-backend /api/articles/ingest
                   ↓
5. TRACK      Log run in ScraperRun table via admin-backend
```

Each stage produces a `StageResult` with:
- `status` (completed / failed / skipped)
- `duration_ms`
- `items_in` / `items_out`
- `error` (if any)

The full `PipelineRun` is kept in memory (last 200 runs) and available
via `GET /api/v1/pipeline/history`.

---

## 🐳 Docker

```bash
# Build
docker build -t content-engine .

# Run
docker run -d \
  --name content-engine \
  -p 8000:8000 \
  --env-file .env \
  content-engine
```

---

## 🔐 Authentication

### Incoming Requests (to Content Engine)

All endpoints (except `/health`) require `X-API-Key` header matching `ENGINE_API_KEY`.

In development, if `ENGINE_API_KEY` is empty, auth is bypassed.

### Outgoing Requests (to Admin Backend)

The Content Engine sends `Authorization: Bearer <CONTENT_ENGINE_API_KEY>` when
delivering articles/market data to admin-backend.

Admin-backend accepts this key via its `CONTENT_ENGINE_API_KEY` env var.

---

## 📊 Admin Dashboard

The admin-frontend includes a full Content Engine management UI at `/content-engine`:

- **Dashboard** — service health, quick pipeline triggers, ingest stats
- **Pipeline Monitor** — run history with per-stage detail view
- **Scheduler** — view/pause/resume/delete scheduled jobs
- **Sources** — list RSS feeds, NewsAPI, market sources
- **AI Processing** — AI provider status, feature overview, test area

Access: Super Admin only (via admin-backend proxy at `/api/content-engine/*`).
