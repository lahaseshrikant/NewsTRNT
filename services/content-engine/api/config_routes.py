# services/content-engine/api/config_routes.py
"""Configuration API routes — view and update engine settings at runtime."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import get_settings
from middleware.auth import verify_api_key
from models.responses import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/config", tags=["config"])


class UpdateConfigRequest(BaseModel):
    """Partial config update (only the fields the admin sends)."""
    news_interval_minutes: int | None = None
    market_interval_minutes: int | None = None
    max_articles_per_run: int | None = None
    enable_scheduler: bool | None = None
    ai_model: str | None = None


@router.get("/")
async def get_config():
    """Return current engine configuration (non-secret fields)."""
    s = get_settings()
    return APIResponse(
        data={
            "environment": s.environment,
            "engine_port": s.engine_port,
            "ai_model": s.ai_model,
            "ai_available": bool(s.openai_api_key),
            "news_api_configured": bool(s.news_api_key),
            "admin_backend_url": s.admin_backend_url,
            "enable_scheduler": s.enable_scheduler,
            "news_interval_minutes": s.news_interval_minutes,
            "market_interval_minutes": s.market_interval_minutes,
            "max_articles_per_run": s.max_articles_per_run,
            "log_level": s.log_level,
        },
        message="Current configuration",
    )


@router.patch("/", dependencies=[Depends(verify_api_key)])
async def update_config(req: UpdateConfigRequest):
    """Update runtime configuration.

    NOTE: This modifies the in-memory settings only.
    Restart required for env-only settings to take effect.
    """
    s = get_settings()
    changed = {}

    if req.news_interval_minutes is not None:
        s.news_interval_minutes = req.news_interval_minutes
        changed["news_interval_minutes"] = req.news_interval_minutes

    if req.market_interval_minutes is not None:
        s.market_interval_minutes = req.market_interval_minutes
        changed["market_interval_minutes"] = req.market_interval_minutes

    if req.max_articles_per_run is not None:
        s.max_articles_per_run = req.max_articles_per_run
        changed["max_articles_per_run"] = req.max_articles_per_run

    if req.enable_scheduler is not None:
        s.enable_scheduler = req.enable_scheduler
        changed["enable_scheduler"] = req.enable_scheduler

    if req.ai_model is not None:
        s.ai_model = req.ai_model
        changed["ai_model"] = req.ai_model

    if not changed:
        raise HTTPException(status_code=400, detail="No fields to update")

    logger.info("Config updated: %s", changed)
    return APIResponse(data=changed, message=f"Updated {len(changed)} setting(s)")
