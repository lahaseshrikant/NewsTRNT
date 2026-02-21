# services/content-engine/config.py
"""
Centralised configuration loaded from environment variables.
Uses pydantic-settings for validation and type coercion.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings
from pydantic import Field

# Ensure .env is loaded even outside FastAPI lifecycle
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)


class Settings(BaseSettings):
    """All configuration knobs for the Content Engine."""

    # ── Service ───────────────────────────────────────────────
    engine_port: int = Field(8000, alias="ENGINE_PORT")
    engine_host: str = Field("0.0.0.0", alias="ENGINE_HOST")
    engine_api_key: str = Field("", alias="ENGINE_API_KEY")
    engine_log_level: str = Field("INFO", alias="ENGINE_LOG_LEVEL")
    engine_workers: int = Field(1, alias="ENGINE_WORKERS")
    environment: str = Field("development", alias="ENGINE_ENV")

    # ── Admin Backend ─────────────────────────────────────────
    admin_backend_url: str = Field(
        "http://localhost:5002", alias="ADMIN_BACKEND_URL"
    )
    market_ingest_api_key: str = Field("", alias="MARKET_INGEST_API_KEY")
    content_engine_api_key: str = Field("", alias="CONTENT_ENGINE_API_KEY")

    # ── AI ────────────────────────────────────────────────────
    openai_api_key: str = Field("", alias="OPENAI_API_KEY")
    ai_model: str = Field("gpt-3.5-turbo", alias="AI_MODEL")
    ai_max_tokens: int = Field(4096, alias="AI_MAX_TOKENS")
    ai_temperature: float = Field(0.3, alias="AI_TEMPERATURE")

    # ── News Sources ──────────────────────────────────────────
    news_api_key: str = Field("", alias="NEWS_API_KEY")

    # ── Scheduler intervals ───────────────────────────────────
    enable_scheduler: bool = Field(True, alias="ENABLE_SCHEDULER")
    news_interval_minutes: int = Field(30, alias="NEWS_INTERVAL_MINUTES")
    market_interval_minutes: int = Field(15, alias="MARKET_INTERVAL_MINUTES")
    max_articles_per_run: int = Field(50, alias="MAX_ARTICLES_PER_RUN")
    default_timezone: str = Field("UTC", alias="DEFAULT_TIMEZONE")

    # ── Redis ─────────────────────────────────────────────────
    redis_url: str = Field("", alias="REDIS_URL")

    # ── Database (read-only, optional) ────────────────────────
    database_url: str = Field("", alias="DATABASE_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True

    # ── Derived helpers ───────────────────────────────────────

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def log_level(self) -> str:
        return self.engine_log_level.upper()


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
