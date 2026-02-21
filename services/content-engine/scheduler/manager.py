# services/content-engine/scheduler/manager.py
"""APScheduler-based scheduler for periodic pipeline runs.

Manages:
  - ``news_pipeline`` — full scrape+AI+delivery (default: every 30 min)
  - ``market_pipeline`` — TradingView indices (default: every 15 min)
  - Custom user-defined jobs via the /scheduler API
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Dict, List, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler  # type: ignore
from apscheduler.triggers.cron import CronTrigger  # type: ignore
from apscheduler.triggers.interval import IntervalTrigger  # type: ignore

from config import get_settings
from models.pipeline import ScheduledJob, SchedulerStatus

logger = logging.getLogger(__name__)


class SchedulerManager:
    """Wraps APScheduler and exposes pipeline scheduling to the API layer."""

    def __init__(self) -> None:
        self._scheduler = AsyncIOScheduler(timezone="UTC")
        self._jobs: Dict[str, ScheduledJob] = {}
        self._total_runs = 0
        self._successful_runs = 0
        self._failed_runs = 0
        self._started_at: Optional[datetime] = None

        # Pipeline reference is injected after init (avoids circular import)
        self._pipeline = None

    def set_pipeline(self, pipeline) -> None:  # noqa: ANN001
        """Inject the PipelineOrchestrator (called from ``main.py`` lifespan)."""
        self._pipeline = pipeline

    # ── Lifecycle ────────────────────────────────────────────────────

    async def start(self) -> None:
        settings = get_settings()
        if not settings.enable_scheduler:
            logger.info("Scheduler disabled via ENABLE_SCHEDULER=false")
            return

        # Register default jobs
        self._add_default_jobs(settings)

        self._scheduler.start()
        self._started_at = datetime.utcnow()
        logger.info("Scheduler started with %d jobs", len(self._jobs))

    async def stop(self) -> None:
        if self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped")

    @property
    def running(self) -> bool:
        return self._scheduler.running

    # ── Default jobs ─────────────────────────────────────────────────

    def _add_default_jobs(self, settings) -> None:
        # News pipeline
        news_interval = settings.news_interval_minutes
        self._scheduler.add_job(
            self._run_news_pipeline,
            trigger=IntervalTrigger(minutes=news_interval),
            id="news_pipeline",
            name="News Pipeline",
            replace_existing=True,
        )
        self._jobs["news_pipeline"] = ScheduledJob(
            job_id="news_pipeline",
            name="News Pipeline",
            pipeline_type="full",
            interval_minutes=news_interval,
            enabled=True,
        )

        # Market pipeline
        market_interval = settings.market_interval_minutes
        self._scheduler.add_job(
            self._run_market_pipeline,
            trigger=IntervalTrigger(minutes=market_interval),
            id="market_pipeline",
            name="Market Pipeline",
            replace_existing=True,
        )
        self._jobs["market_pipeline"] = ScheduledJob(
            job_id="market_pipeline",
            name="Market Pipeline",
            pipeline_type="market_only",
            interval_minutes=market_interval,
            enabled=True,
        )

    # ── Job runners ──────────────────────────────────────────────────

    async def _run_news_pipeline(self) -> None:
        if not self._pipeline:
            logger.warning("Pipeline not set — skipping news run")
            return
        try:
            self._total_runs += 1
            run = await self._pipeline.run_full(triggered_by="scheduler")
            if run.status.value == "success":
                self._successful_runs += 1
            else:
                self._failed_runs += 1
            self._jobs["news_pipeline"].last_run_at = datetime.utcnow()
        except Exception as exc:
            self._failed_runs += 1
            logger.error("Scheduled news pipeline failed: %s", exc)

    async def _run_market_pipeline(self) -> None:
        if not self._pipeline:
            logger.warning("Pipeline not set — skipping market run")
            return
        try:
            self._total_runs += 1
            run = await self._pipeline.run_market(triggered_by="scheduler")
            if run.status.value == "success":
                self._successful_runs += 1
            else:
                self._failed_runs += 1
            self._jobs["market_pipeline"].last_run_at = datetime.utcnow()
        except Exception as exc:
            self._failed_runs += 1
            logger.error("Scheduled market pipeline failed: %s", exc)

    # ── Job management ───────────────────────────────────────────────

    def add_job(
        self,
        job_id: str,
        name: str,
        pipeline_type: str,
        interval_minutes: int = 30,
        cron_expression: str | None = None,
    ) -> ScheduledJob:
        """Add a custom scheduled job."""
        if cron_expression:
            trigger = CronTrigger.from_crontab(cron_expression)
        else:
            trigger = IntervalTrigger(minutes=interval_minutes)

        # Choose runner based on pipeline type
        runner = self._run_market_pipeline if pipeline_type == "market_only" else self._run_news_pipeline

        self._scheduler.add_job(runner, trigger=trigger, id=job_id, name=name, replace_existing=True)

        job = ScheduledJob(
            job_id=job_id,
            name=name,
            pipeline_type=pipeline_type,
            interval_minutes=interval_minutes,
            cron_expression=cron_expression,
            enabled=True,
        )
        self._jobs[job_id] = job
        logger.info("Added job %s (%s, every %d min)", job_id, pipeline_type, interval_minutes)
        return job

    def remove_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            try:
                self._scheduler.remove_job(job_id)
            except Exception:
                pass
            del self._jobs[job_id]
            return True
        return False

    def pause_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            self._scheduler.pause_job(job_id)
            self._jobs[job_id].enabled = False
            return True
        return False

    def resume_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            self._scheduler.resume_job(job_id)
            self._jobs[job_id].enabled = True
            return True
        return False

    # ── Status ───────────────────────────────────────────────────────

    def status(self) -> SchedulerStatus:
        uptime = 0.0
        if self._started_at:
            uptime = (datetime.utcnow() - self._started_at).total_seconds()

        return SchedulerStatus(
            running=self.running,
            jobs=list(self._jobs.values()),
            uptime_s=uptime,
            total_runs=self._total_runs,
            successful_runs=self._successful_runs,
            failed_runs=self._failed_runs,
        )
