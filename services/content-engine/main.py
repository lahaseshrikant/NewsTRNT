# services/content-engine/main.py
"""
Content Engine — FastAPI application entry point.

Start with:
    python main.py
    # or
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import logging
import sys
import time
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from middleware.logging_mw import RequestLoggingMiddleware

# ── Route imports ─────────────────────────────────────────────
from api.health import router as health_router
from api.scraping import router as scraping_router
from api.ai_processing import router as ai_router
from api.scheduler_routes import router as scheduler_router, set_scheduler
from api.pipeline_routes import router as pipeline_router, set_pipeline
from api.config_routes import router as config_router

# ── Core ──────────────────────────────────────────────────────
from core.pipeline import PipelineOrchestrator
from scheduler.manager import SchedulerManager

settings = get_settings()

# ── Logging setup ─────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("content-engine")


# ── Lifespan (startup / shutdown) ─────────────────────────────

@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup and shutdown hooks."""
    start_time = time.time()
    application.state.start_time = start_time

    logger.info(
        "Content Engine starting — port=%s env=%s",
        settings.engine_port,
        settings.environment,
    )

    # Initialise pipeline orchestrator
    pipeline = PipelineOrchestrator()
    application.state.pipeline = pipeline
    set_pipeline(pipeline)

    # Initialise and start scheduler
    scheduler = SchedulerManager()
    scheduler.set_pipeline(pipeline)
    application.state.scheduler = scheduler
    set_scheduler(scheduler)
    await scheduler.start()

    yield  # ← application is running

    # Shutdown
    await scheduler.stop()
    await pipeline.close()
    logger.info("Content Engine shut down gracefully")


# ── FastAPI App ───────────────────────────────────────────────

app = FastAPI(
    title="NewsTRNT Content Engine",
    description=(
        "AI-powered content pipeline — scraping, summarisation, classification, "
        "SEO optimisation, market data collection, sentiment analysis and more."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

# ── Mount routers ─────────────────────────────────────────────
# Each router already has its own prefix (e.g., /scraping, /ai, /scheduler…)
# We add /api/v1 as the top-level prefix.

app.include_router(health_router,     prefix="/api/v1")
app.include_router(scraping_router,   prefix="/api/v1")
app.include_router(ai_router,         prefix="/api/v1")
app.include_router(scheduler_router,  prefix="/api/v1")
app.include_router(pipeline_router,   prefix="/api/v1")
app.include_router(config_router,     prefix="/api/v1")


# ── CLI entry ─────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.engine_port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
    )
