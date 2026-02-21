# services/content-engine/api/health.py
"""Health and status endpoints."""

from __future__ import annotations

import platform
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Request

from config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
async def health_check():
    """Basic health check — always returns 200 when the server is up."""
    return {
        "status": "healthy",
        "service": "content-engine",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/status")
async def service_status(request: Request):
    """Detailed service status including uptime, environment, and queue info."""
    start = getattr(request.app.state, "start_time", 0.0)
    uptime = time.time() - start if start else 0

    return {
        "status": "running",
        "version": "2.0.0",
        "environment": settings.environment,
        "uptime_seconds": round(uptime, 1),
        "uptime_human": _format_uptime(uptime),
        "python_version": platform.python_version(),
        "platform": platform.system(),
        "scheduler_enabled": settings.enable_scheduler,
        "ai_model": settings.ai_model,
        "admin_backend_url": settings.admin_backend_url,
        "features": {
            "news_scraping": True,
            "market_scraping": True,
            "ai_summarization": bool(settings.openai_api_key),
            "sentiment_analysis": True,
            "seo_optimization": True,
            "fact_checking": bool(settings.openai_api_key),
            "scheduler": settings.enable_scheduler,
            "redis_cache": bool(settings.redis_url),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _format_uptime(seconds: float) -> str:
    """Convert seconds to human-readable string like '2h 14m 5s'."""
    h, remainder = divmod(int(seconds), 3600)
    m, s = divmod(remainder, 60)
    parts = []
    if h:
        parts.append(f"{h}h")
    if m:
        parts.append(f"{m}m")
    parts.append(f"{s}s")
    return " ".join(parts)
