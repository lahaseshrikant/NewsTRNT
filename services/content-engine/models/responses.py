# services/content-engine/models/responses.py
"""Standard API response wrappers used across all endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard envelope for all JSON responses."""

    success: bool = True
    data: Optional[T] = None
    message: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    success: bool = False
    error: str
    detail: Optional[str] = None
    code: str = "INTERNAL_ERROR"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""

    success: bool = True
    data: list[T] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    per_page: int = 20
    has_more: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    service: str = "content-engine"
    version: str = "1.0.0"
    uptime_s: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusResponse(BaseModel):
    """Detailed status response."""

    status: str = "healthy"
    service: str = "content-engine"
    version: str = "1.0.0"
    uptime_s: float = 0.0
    environment: str = "development"
    features: dict[str, bool] = Field(default_factory=dict)
    stats: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JobTriggerResponse(BaseModel):
    """Response when a pipeline job is triggered."""

    run_id: str
    pipeline_type: str
    status: str = "started"
    message: str = ""


class ScrapingStatusResponse(BaseModel):
    """Current state of scraping sources."""

    total_sources: int = 0
    active_sources: int = 0
    sources: list[dict[str, Any]] = Field(default_factory=list)
    last_scrape_at: Optional[datetime] = None


class AIStatusResponse(BaseModel):
    """Current state of AI services."""

    provider: str = "openai"
    model: str = ""
    available: bool = True
    total_processed: int = 0
    avg_latency_ms: float = 0.0
