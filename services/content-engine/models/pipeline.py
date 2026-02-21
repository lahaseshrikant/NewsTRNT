# services/content-engine/models/pipeline.py
"""Pydantic models for pipeline tracking and scheduler state."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ─── Pipeline run tracking ───────────────────────────────────────────

class PipelineStage(str, Enum):
    SCRAPING = "scraping"
    DEDUPLICATION = "deduplication"
    AI_PROCESSING = "ai_processing"
    DELIVERY = "delivery"
    COMPLETE = "complete"
    FAILED = "failed"


class PipelineStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    PARTIAL = "partial"  # some stages had errors
    FAILED = "failed"
    CANCELLED = "cancelled"


class StageResult(BaseModel):
    """Result of a single pipeline stage."""

    stage: PipelineStage
    status: str = "pending"
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    items_in: int = 0
    items_out: int = 0
    errors: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PipelineRun(BaseModel):
    """A single pipeline execution record."""

    run_id: str
    pipeline_type: str = "full"  # full | news_only | market_only | reprocess
    status: PipelineStatus = PipelineStatus.PENDING
    triggered_by: str = "scheduler"  # scheduler | manual | webhook | admin
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
    stages: list[StageResult] = Field(default_factory=list)
    articles_scraped: int = 0
    articles_processed: int = 0
    articles_delivered: int = 0
    articles_deduplicated: int = 0
    errors: list[str] = Field(default_factory=list)
    duration_s: float = 0.0


class PipelineRunSummary(BaseModel):
    """Lightweight pipeline run summary for listing endpoints."""

    run_id: str
    pipeline_type: str
    status: PipelineStatus
    triggered_by: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    articles_delivered: int = 0
    errors_count: int = 0
    duration_s: float = 0.0


# ─── Scheduler models ────────────────────────────────────────────────

class ScheduleType(str, Enum):
    INTERVAL = "interval"
    CRON = "cron"
    ONCE = "once"


class ScheduledJob(BaseModel):
    """Definition of a scheduled task."""

    job_id: str
    name: str
    pipeline_type: str = "full"
    schedule_type: ScheduleType = ScheduleType.INTERVAL
    interval_minutes: int = 30
    cron_expression: Optional[str] = None
    enabled: bool = True
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SchedulerStatus(BaseModel):
    """Current scheduler state."""

    running: bool
    jobs: list[ScheduledJob] = Field(default_factory=list)
    uptime_s: float = 0.0
    total_runs: int = 0
    successful_runs: int = 0
    failed_runs: int = 0
