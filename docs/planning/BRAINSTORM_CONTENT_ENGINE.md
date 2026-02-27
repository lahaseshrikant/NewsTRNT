# NewsTRNT Content Engine — Grand Brainstorm Document

> **Date:** February 21, 2026
> **Author:** Architecture Team
> **Status:** Planning → Implementation

---

## 1. THE BIG PICTURE: Why Rename & Restructure?

### Current State: `scraper-ai/`
- Runs as a one-shot CLI script (`python pipeline.py`)
- No API server despite FastAPI/uvicorn in deps
- Direct database writes (bypassing backend validation)
- No health monitoring, no scheduling, no queue
- Dead dependencies (redis, newspaper3k, schedule)
- Name "scraper-ai" undersells what it does

### Vision: `services/content-engine/`
A **persistent, API-driven microservice** that is the "brain" of NewsTRNT — responsible for
all content acquisition, AI processing, market data scraping, and intelligent automation.

**New Name: `content-engine`** (alternatives considered: `intelligence-hub`, `news-brain`, `content-pipeline`, `newstrnt-engine`)

**Why "Content Engine"?**
- It's not just a scraper — it summarizes, classifies, optimizes, generates
- It's not just AI — it fetches, ingests, transforms, delivers
- "Engine" conveys it's the powerhouse running continuously
- Professional, scalable naming that makes sense in docs and Docker

---

## 2. THREE-SERVICE ARCHITECTURE

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   USER PLATFORM      │     │   ADMIN PLATFORM     │     │   CONTENT ENGINE    │
│                      │     │                      │     │                     │
│  user-frontend:3000  │     │ admin-frontend:3001  │     │  FastAPI :8000      │
│  user-backend :5000  │     │ admin-backend :5002  │     │  Python 3.11        │
│                      │     │                      │     │                     │
│  - Read articles     │     │  - Manage content    │     │  - Scrape news      │
│  - Browse news       │     │  - Analytics         │     │  - AI summarize     │
│  - User accounts     │     │  - System settings   │     │  - Classify topics  │
│  - Comments/social   │     │  - RBAC/team         │     │  - SEO optimize     │
│  - Personalized feed │     │  - Market config     │     │  - Market scraping  │
│  - Market data view  │     │  - Content moderation│     │  - Fact checking    │
│                      │     │  - Scraper control   │     │  - Sentiment analysis│
└──────────┬───────────┘     └──────────┬───────────┘     │  - Image processing │
           │                            │                  │  - Social media gen │
           │     Shared PostgreSQL      │                  │  - Task scheduling  │
           └────────────┬───────────────┘                  │  - Health monitoring│
                        │                                  │  - Redis caching    │
                        ▼                                  └──────────┬──────────┘
                 ┌──────────────┐                                     │
                 │   Neon DB    │◄────────────────────────────────────┘
                 │  PostgreSQL  │     (via admin-backend API only)
                 └──────────────┘
```

### Communication Patterns:
1. **Content Engine → Admin Backend**: POST processed articles, market data via `/api/market/ingest`
2. **Admin Backend → Content Engine**: Trigger scrapes, configure pipelines via Content Engine API
3. **User Backend**: Read-only from DB (zero direct contact with Content Engine)
4. **Admin Frontend**: Dashboard for Content Engine status, controls, analytics

---

## 3. FEATURE BRAINSTORM — "LAKHS OF IDEAS"

### 🔥 TIER 1: CORE (Must Have — Build Now)

#### A. FastAPI Server (The Foundation)
- [ ] Persistent HTTP server with uvicorn
- [ ] Health check endpoint (`GET /health`)
- [ ] Status endpoint (`GET /status`) — pipeline stats, uptime, queue depth
- [ ] API key authentication middleware
- [ ] CORS configuration
- [ ] Request logging with structured JSON
- [ ] Graceful shutdown handling
- [ ] OpenAPI/Swagger docs auto-generated

#### B. News Scraping Pipeline
- [ ] `POST /api/scrape/news` — trigger news scraping on demand
- [ ] `GET /api/scrape/news/status` — current scraping status
- [ ] `POST /api/scrape/news/sources` — add/update RSS sources
- [ ] `GET /api/scrape/news/sources` — list configured sources
- [ ] `DELETE /api/scrape/news/sources/{id}` — remove source
- [ ] Async background task processing
- [ ] Source health monitoring (detect dead feeds)
- [ ] Configurable article freshness window
- [ ] Rate limiting per source
- [ ] User-agent rotation for scraping
- [ ] Proxy support for geo-restricted sources

#### C. Market Data Scraping
- [ ] `POST /api/scrape/market` — trigger market scrape
- [ ] `GET /api/scrape/market/status` — scraping status
- [ ] Support indices, crypto, forex/currencies, commodities
- [ ] TradingView scraping with anti-bot measures
- [ ] Multiple source fallback (TradingView → Yahoo → Google Finance)
- [ ] Configurable symbols list
- [ ] Batch processing for efficiency
- [ ] Real-time WebSocket price streaming (future)

#### D. AI Processing Pipeline
- [ ] `POST /api/ai/summarize` — summarize article content
- [ ] `POST /api/ai/classify` — classify article topic
- [ ] `POST /api/ai/seo-optimize` — SEO optimization
- [ ] `POST /api/ai/process` — full pipeline (summarize + classify + SEO)
- [ ] Batch processing endpoint for multiple articles
- [ ] Model provider abstraction (OpenAI, Anthropic, local models)
- [ ] Token usage tracking and cost monitoring
- [ ] Fallback to rule-based when AI unavailable
- [ ] Response caching to avoid duplicate processing

#### E. Task Scheduling
- [ ] Built-in APScheduler or Celery-based task queue
- [ ] Configurable cron schedules per task type
- [ ] `GET /api/scheduler/jobs` — list all scheduled jobs
- [ ] `POST /api/scheduler/jobs` — create/update schedule
- [ ] `DELETE /api/scheduler/jobs/{id}` — remove schedule
- [ ] `POST /api/scheduler/jobs/{id}/run` — manual trigger
- [ ] Default schedules:
  - News scraping: every 15 minutes
  - Market data: every 5 minutes during market hours
  - Crypto: every 10 minutes (24/7)
  - AI processing queue: continuous
  - Source health check: hourly
  - Stale data cleanup: daily

#### F. Database & Delivery
- [ ] All writes go through admin-backend API (not direct DB)
- [ ] Retry logic with exponential backoff
- [ ] Deduplication at multiple levels (URL, title similarity, content hash)
- [ ] Batch insertion for efficiency
- [ ] Delivery confirmation tracking

### ⚡ TIER 2: ADVANCED (Should Have — Build Next)

#### G. Fact-Checking Engine
- [ ] `POST /api/ai/fact-check` — verify article claims
- [ ] Cross-reference multiple sources for same story
- [ ] Claim extraction from article text
- [ ] Source credibility scoring
- [ ] Automated fact-check labels (Verified, Disputed, Unverified)
- [ ] Integration with fact-check APIs (ClaimBuster, Google Fact Check)

#### H. Sentiment Analysis
- [ ] `POST /api/ai/sentiment` — analyze article sentiment
- [ ] Headline sentiment vs body sentiment comparison
- [ ] Market sentiment correlation with news
- [ ] Trend detection (sentiment shifts over time)
- [ ] Entity-level sentiment (per company, person, topic)
- [ ] TextBlob + VADER + transformer-based ensemble

#### I. Image Processing
- [ ] `POST /api/media/process` — process article images
- [ ] Automatic thumbnail generation (multiple sizes)
- [ ] Image compression and optimization
- [ ] EXIF data extraction and cleaning
- [ ] Alt-text generation using AI vision models
- [ ] Duplicate image detection
- [ ] NSFW content detection
- [ ] Watermark detection
- [ ] Image CDN upload integration

#### J. Content Quality Scoring
- [ ] Readability scoring (Flesch-Kincaid, Gunning Fog)
- [ ] Grammar and spelling check
- [ ] Clickbait detection
- [ ] Bias detection
- [ ] Source diversity scoring
- [ ] Plagiarism detection (content similarity hashing)
- [ ] Content freshness scoring

#### K. Social Media Integration
- [ ] Auto-generate social posts (Twitter, Facebook, LinkedIn, Instagram)
- [ ] Hashtag generation
- [ ] Optimal posting time recommendations
- [ ] Social share tracking integration
- [ ] Thread generation for long-form content (Twitter threads)
- [ ] Open Graph metadata generation

#### L. Audio/TTS Generation
- [ ] `POST /api/media/tts` — text-to-speech for articles
- [ ] Short summary audio clips (60-100 word summaries)
- [ ] Full article narration
- [ ] Multiple voice options
- [ ] Podcast feed generation
- [ ] Audio file CDN upload

### 🚀 TIER 3: PREMIUM (Nice to Have — Future)

#### M. Personalization Engine
- [ ] User reading pattern analysis
- [ ] Content recommendation API
- [ ] Topic affinity scoring
- [ ] Collaborative filtering
- [ ] Cold-start recommendations for new users
- [ ] A/B test headline selection

#### N. Real-Time Features
- [ ] WebSocket server for live updates
- [ ] Breaking news detection and alerts
- [ ] Market price streaming
- [ ] Live event coverage tracking
- [ ] Push notification triggers

#### O. Multi-Language Support
- [ ] `POST /api/ai/translate` — article translation
- [ ] Auto-detect source language
- [ ] Translation quality scoring
- [ ] Regional news source support
- [ ] Multi-language SEO optimization

#### P. Advanced Analytics
- [ ] Content performance prediction
- [ ] Trending topic detection
- [ ] Source reliability ranking
- [ ] Scraping success rate analytics
- [ ] AI processing cost analytics
- [ ] Pipeline throughput metrics
- [ ] Custom Prometheus/Grafana metrics

#### Q. ML Model Training
- [ ] Train custom topic classifiers on your data
- [ ] Fine-tune summarization models
- [ ] Named entity recognition (NER) for people, orgs, locations
- [ ] Event extraction (what happened, when, where)
- [ ] Relationship extraction between entities

#### R. Data Enrichment
- [ ] Wikipedia entity linking
- [ ] Stock ticker extraction and linking
- [ ] Geographic location extraction and mapping
- [ ] Timeline generation for evolving stories
- [ ] Related article clustering

---

## 4. API DESIGN — Content Engine

### Base URL: `http://localhost:8000/api/v1`

### Authentication
- API key in header: `X-API-Key: <key>` or `Authorization: Bearer <key>`
- Separate keys for admin-backend vs external access
- Rate limiting per key

### Endpoints Overview

```
# Health & Status
GET  /health                          → { status, uptime, version }
GET  /status                          → { queues, jobs, metrics }

# News Scraping
POST /scrape/news                     → trigger news scraping
GET  /scrape/news/status              → current scraping status
GET  /scrape/news/sources             → list RSS/API sources
POST /scrape/news/sources             → add/update source
DELETE /scrape/news/sources/{id}      → remove source

# Market Scraping
POST /scrape/market                   → trigger market scrape
GET  /scrape/market/status            → scraping status
POST /scrape/market/symbols           → configure symbol list

# AI Processing
POST /ai/summarize                    → summarize text
POST /ai/classify                     → classify topic
POST /ai/seo-optimize                → SEO analysis
POST /ai/fact-check                   → fact verification
POST /ai/sentiment                    → sentiment analysis
POST /ai/process                      → full pipeline
POST /ai/batch                        → batch processing

# Media Processing
POST /media/process-image             → optimize/resize image
POST /media/generate-tts              → text-to-speech
POST /media/generate-alt-text         → AI alt-text for images

# Scheduler
GET  /scheduler/jobs                  → list scheduled jobs
POST /scheduler/jobs                  → create/update job
DELETE /scheduler/jobs/{id}           → remove job
POST /scheduler/jobs/{id}/trigger     → manual trigger
GET  /scheduler/history               → execution history

# Pipeline Management
GET  /pipeline/runs                   → pipeline execution history
GET  /pipeline/runs/{id}              → specific run details
POST /pipeline/run                    → trigger full pipeline
GET  /pipeline/metrics                → processing metrics

# Configuration
GET  /config                          → current configuration
PUT  /config                          → update configuration
GET  /config/providers                → AI/scraping provider status
```

---

## 5. DATA MODELS

### ScrapedArticle (internal)
```python
class ScrapedArticle:
    source_url: str
    title: str
    content: str
    author: str | None
    published_at: datetime | None
    image_url: str | None
    source_name: str
    source_type: str  # rss, newsapi, custom

    # AI-enriched fields
    summary: str | None
    short_summary: str | None
    category: str | None
    category_confidence: float
    keywords: list[str]
    sentiment_score: float
    sentiment_label: str  # positive, negative, neutral
    fact_check_status: str  # verified, disputed, unverified
    seo_score: float
    seo_slug: str
    meta_description: str
    readability_score: float
    social_posts: dict  # twitter, facebook, linkedin
    alt_headlines: list[str]
    key_quotes: list[str]
    schema_markup: dict
```

### MarketQuote (internal)
```python
class MarketQuote:
    symbol: str
    name: str
    type: str  # index, crypto, currency, commodity
    last_price: float
    change: float
    change_percent: float
    high: float
    low: float
    volume: int | None
    currency: str
    exchange: str
    country: str
    timestamp: datetime
```

### PipelineRun (tracking)
```python
class PipelineRun:
    id: str
    type: str  # news, market, full
    status: str  # running, completed, failed
    started_at: datetime
    completed_at: datetime | None
    articles_fetched: int
    articles_processed: int
    articles_saved: int
    articles_failed: int
    errors: list[str]
    duration_seconds: float
    ai_tokens_used: int
    ai_cost_usd: float
```

### ScheduledJob (scheduler)
```python
class ScheduledJob:
    id: str
    name: str
    task_type: str  # news_scrape, market_scrape, ai_process, cleanup
    cron_expression: str
    enabled: bool
    last_run: datetime | None
    next_run: datetime | None
    config: dict
```

---

## 6. INTER-SERVICE COMMUNICATION PROTOCOL

### Content Engine → Admin Backend (Delivery)

```
POST http://admin-backend:5002/api/market/ingest
Headers:
  Authorization: Bearer <MARKET_INGEST_API_KEY>
  Content-Type: application/json
Body: {
  scraperName: "content-engine",
  dataType: "indices" | "crypto" | "currencies" | "commodities",
  items: [...],
  generatedAt: "ISO8601"
}
```

### NEW: Content Engine → Admin Backend (Article Delivery)

```
POST http://admin-backend:5002/api/articles/ingest
Headers:
  Authorization: Bearer <CONTENT_ENGINE_API_KEY>
  Content-Type: application/json
Body: {
  source: "content-engine",
  articles: [{
    title, content, summary, shortSummary, category,
    keywords, imageUrl, sourceUrl, author, publishedAt,
    seoSlug, metaDescription, sentiment, factCheckStatus,
    schemaMarkup, socialPosts, altHeadlines
  }]
}
```

### Admin Backend → Content Engine (Control)

```
POST http://content-engine:8000/api/v1/scrape/news
Headers:
  X-API-Key: <ENGINE_API_KEY>
Body: { maxArticles: 50, sources: ["all"] }

POST http://content-engine:8000/api/v1/scrape/market
Headers:
  X-API-Key: <ENGINE_API_KEY>
Body: { types: ["indices", "crypto"], limit: 100 }

POST http://content-engine:8000/api/v1/ai/process
Headers:
  X-API-Key: <ENGINE_API_KEY>
Body: { articleId: "...", content: "...", operations: ["summarize", "classify", "seo"] }
```

---

## 7. CONFIGURATION & ENVIRONMENT

### Content Engine `.env`
```env
# Service
ENGINE_PORT=8000
ENGINE_API_KEY=your-engine-api-key
ENGINE_LOG_LEVEL=INFO
ENGINE_WORKERS=4

# Admin Backend Connection
ADMIN_BACKEND_URL=http://localhost:5002
MARKET_INGEST_API_KEY=your-ingest-key
CONTENT_ENGINE_API_KEY=your-engine-key

# AI Providers
OPENAI_API_KEY=your-openai-key
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.3

# News Sources
NEWS_API_KEY=your-newsapi-key
RSS_FETCH_INTERVAL_MINUTES=15

# Market Data
MARKET_SCRAPE_INTERVAL_MINUTES=5
MARKET_CRYPTO_INTERVAL_MINUTES=10

# Database (for read-only analytics/caching, NOT direct writes)
REDIS_URL=redis://localhost:6379/0

# Scheduling
ENABLE_SCHEDULER=true
DEFAULT_TIMEZONE=UTC

# Storage
TEMP_DIR=/tmp/content-engine
MAX_CONTENT_SIZE_MB=50
```

---

## 8. DIRECTORY STRUCTURE

```
services/content-engine/
├── Dockerfile
├── docker-compose.yml          # standalone dev compose
├── requirements.txt
├── pyproject.toml               # modern Python packaging
├── setup.py
├── .env.example
├── README.md
├── main.py                      # FastAPI app entry point
├── config.py                    # configuration management
│
├── api/                         # FastAPI route handlers
│   ├── __init__.py
│   ├── health.py               # /health, /status
│   ├── scraping.py             # /scrape/* endpoints
│   ├── ai_processing.py        # /ai/* endpoints
│   ├── media.py                # /media/* endpoints
│   ├── scheduler.py            # /scheduler/* endpoints
│   ├── pipeline.py             # /pipeline/* endpoints
│   └── config_routes.py        # /config/* endpoints
│
├── core/                        # Business logic
│   ├── __init__.py
│   ├── pipeline.py             # Main orchestration pipeline
│   ├── delivery.py             # Send processed data to admin-backend
│   ├── deduplication.py        # Content deduplication logic
│   └── quality.py              # Content quality scoring
│
├── scraping/                    # All scraping modules
│   ├── __init__.py
│   ├── base.py                 # Base scraper class
│   ├── rss_scraper.py          # RSS feed scraper
│   ├── newsapi_scraper.py      # NewsAPI integration
│   ├── tradingview_scraper.py  # TradingView market data
│   ├── crypto_scraper.py       # Cryptocurrency data
│   ├── forex_scraper.py        # Forex/currency data
│   └── source_manager.py       # Dynamic source management
│
├── ai/                          # AI processing modules
│   ├── __init__.py
│   ├── provider.py             # AI provider abstraction
│   ├── summarizer.py           # Article summarization
│   ├── classifier.py           # Topic classification
│   ├── seo_optimizer.py        # SEO optimization
│   ├── sentiment.py            # Sentiment analysis
│   ├── fact_checker.py         # Fact-checking
│   ├── headline_gen.py         # Alternative headlines
│   ├── social_gen.py           # Social media post generation
│   └── tts.py                  # Text-to-speech
│
├── media/                       # Media processing
│   ├── __init__.py
│   ├── image_processor.py      # Image optimization
│   └── alt_text.py             # AI alt-text generation
│
├── scheduler/                   # Task scheduling
│   ├── __init__.py
│   ├── manager.py              # Schedule management
│   ├── tasks.py                # Task definitions
│   └── cron.py                 # Cron expression helpers
│
├── models/                      # Data models (Pydantic)
│   ├── __init__.py
│   ├── article.py
│   ├── market.py
│   ├── pipeline.py
│   ├── scheduler.py
│   └── responses.py            # API response models
│
├── middleware/                   # FastAPI middleware
│   ├── __init__.py
│   ├── auth.py                 # API key authentication
│   ├── logging.py              # Request logging
│   └── rate_limit.py           # Rate limiting
│
├── utils/                       # Shared utilities
│   ├── __init__.py
│   ├── http_client.py          # Async HTTP client with retries
│   ├── text_processing.py      # Text cleaning, normalization
│   ├── slug_generator.py       # URL slug generation
│   └── metrics.py              # Prometheus metrics
│
└── tests/                       # Test suite
    ├── __init__.py
    ├── conftest.py
    ├── test_health.py
    ├── test_scraping.py
    ├── test_ai.py
    ├── test_pipeline.py
    └── test_scheduler.py
```

---

## 9. PROBLEMS IDENTIFIED & SOLUTIONS

| # | Problem | Solution |
|---|---------|----------|
| 1 | Direct DB writes bypass validation | Route all writes through admin-backend API |
| 2 | No API server — runs as CLI script | Build FastAPI persistent server |
| 3 | No authentication | API key middleware |
| 4 | No scheduling | APScheduler with configurable cron |
| 5 | No health monitoring | /health endpoint + Docker healthcheck |
| 6 | Dead dependencies | Clean up requirements, add only what's used |
| 7 | DB connection mismatch | Standardize on DATABASE_URL parsing |
| 8 | No error recovery | Retry logic with exponential backoff |
| 9 | No rate limiting on external APIs | Per-source rate limiter |
| 10 | No content deduplication | Multi-level dedup (URL, title hash, content similarity) |
| 11 | No AI cost tracking | Token counter middleware |
| 12 | No queue for background tasks | Background task runner with status tracking |
| 13 | No logging structure | Structured JSON logging |
| 14 | Single AI provider lock-in | Provider abstraction layer |
| 15 | No testing | pytest test suite |
| 16 | No metrics/monitoring | Prometheus metrics endpoint |
| 17 | Name doesn't reflect scope | Rename to content-engine |
| 18 | No WebSocket for real-time | Plan for future WebSocket support |
| 19 | No article ingest endpoint in admin | Create /api/articles/ingest |
| 20 | No admin UI for Content Engine | Build dashboard in admin-frontend |

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Foundation (NOW)
1. Rename `scraper-ai` → `services/content-engine`
2. Create FastAPI server with health/status endpoints
3. Port existing scraping and AI modules to new structure
4. Implement API key authentication
5. Create delivery module (post to admin-backend)
6. Add structured logging
7. Update Docker configuration
8. Create comprehensive documentation

### Phase 2: Core Features
9. Implement task scheduler with default schedules
10. Build all scraping API endpoints
11. Build all AI processing API endpoints
12. Add admin-backend endpoints for article ingestion
13. Wire admin-backend → content-engine communication
14. Build admin-frontend dashboard for content engine

### Phase 3: Advanced
15. Sentiment analysis
16. Fact-checking engine
17. Image processing pipeline
18. Social media post generation
19. Content quality scoring
20. AI cost tracking

### Phase 4: Premium
21. TTS/audio generation
22. Multi-language support
23. Real-time WebSocket streaming
24. ML model training pipeline
25. Advanced analytics and Prometheus metrics

---

## 11. ADMIN UI — Content Engine Dashboard

### Pages to Add in Admin Frontend:

1. **`/content-engine`** — Overview Dashboard
   - Service status (online/offline)
   - Uptime
   - Queue depth (pending articles)
   - Last scrape timestamps
   - Articles processed today/week/month
   - AI token usage graph
   - Error rate chart

2. **`/content-engine/scraping`** — Scraping Management
   - Source list with health indicators
   - Add/edit/remove RSS sources
   - Trigger manual scrapes
   - Per-source statistics
   - Last fetch timestamps
   - Error logs per source

3. **`/content-engine/ai`** — AI Processing
   - Processing queue status
   - Token usage dashboard
   - Cost tracking
   - Model configuration
   - Test AI features (summarize/classify sample text)

4. **`/content-engine/scheduler`** — Task Scheduler
   - Job list with cron expressions
   - Enable/disable jobs
   - Manual trigger buttons
   - Execution history with success/failure rates
   - Next run countdown

5. **`/content-engine/market`** — Market Data
   - Configured symbols
   - Scraping status
   - Data freshness indicators
   - Manual scrape triggers

6. **`/content-engine/logs`** — Logs & Monitoring
   - Real-time log stream
   - Error filtering
   - Pipeline run history
   - Performance metrics

---

*This document serves as the master brainstorm. Implementation begins now.*
