# services/content-engine/api/scheduler_routes.py
"""Scheduler API routes — view, create, pause, resume, and remove scheduled jobs."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from middleware.auth import verify_api_key
from models.responses import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scheduler", tags=["scheduler"])

# The SchedulerManager instance is injected at startup via app.state
_scheduler = None


def set_scheduler(mgr) -> None:
    """Called from main.py lifespan to inject the scheduler instance."""
    global _scheduler
    _scheduler = mgr


def _get_scheduler():
    if _scheduler is None:
        raise HTTPException(status_code=503, detail="Scheduler not initialized")
    return _scheduler


# ── Request models ───────────────────────────────────────────────────

class CreateJobRequest(BaseModel):
    job_id: str
    name: str
    pipeline_type: str = "full"
    interval_minutes: int = 30
    cron_expression: Optional[str] = None


class UpdateJobRequest(BaseModel):
    action: str  # pause | resume | remove


# ── Routes ───────────────────────────────────────────────────────────

@router.get("/status")
async def scheduler_status():
    """Get current scheduler status and all jobs."""
    mgr = _get_scheduler()
    st = mgr.status()
    return APIResponse(
        data={
            "running": st.running,
            "uptime_s": st.uptime_s,
            "total_runs": st.total_runs,
            "successful_runs": st.successful_runs,
            "failed_runs": st.failed_runs,
            "jobs": [j.model_dump() for j in st.jobs],
        },
        message="Scheduler status",
    )


@router.post("/jobs", dependencies=[Depends(verify_api_key)])
async def create_job(req: CreateJobRequest):
    """Create a new scheduled pipeline job."""
    mgr = _get_scheduler()
    job = mgr.add_job(
        job_id=req.job_id,
        name=req.name,
        pipeline_type=req.pipeline_type,
        interval_minutes=req.interval_minutes,
        cron_expression=req.cron_expression,
    )
    return APIResponse(data=job.model_dump(), message=f"Job {req.job_id} created")


@router.patch("/jobs/{job_id}", dependencies=[Depends(verify_api_key)])
async def update_job(job_id: str, req: UpdateJobRequest):
    """Pause, resume, or remove a scheduled job."""
    mgr = _get_scheduler()

    if req.action == "pause":
        ok = mgr.pause_job(job_id)
    elif req.action == "resume":
        ok = mgr.resume_job(job_id)
    elif req.action == "remove":
        ok = mgr.remove_job(job_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {req.action}")

    if not ok:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return APIResponse(message=f"Job {job_id} {req.action}d")


@router.delete("/jobs/{job_id}", dependencies=[Depends(verify_api_key)])
async def delete_job(job_id: str):
    """Remove a scheduled job."""
    mgr = _get_scheduler()
    if not mgr.remove_job(job_id):
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return APIResponse(message=f"Job {job_id} removed")
