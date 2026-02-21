# services/content-engine/api/pipeline_routes.py
"""Pipeline API routes — trigger runs, view history, get run details."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from middleware.auth import verify_api_key
from models.responses import APIResponse, JobTriggerResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pipeline", tags=["pipeline"])

# Injected from main.py lifespan
_pipeline = None


def set_pipeline(p) -> None:
    global _pipeline
    _pipeline = p


def _get_pipeline():
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")
    return _pipeline


# ── Request models ───────────────────────────────────────────────────

class TriggerRequest(BaseModel):
    pipeline_type: str = "full"  # full | market_only | news_only
    max_articles: int = 50


# ── Routes ───────────────────────────────────────────────────────────

@router.post("/trigger", dependencies=[Depends(verify_api_key)], response_model=APIResponse)
async def trigger_pipeline(req: TriggerRequest):
    """Manually trigger a pipeline run."""
    pipe = _get_pipeline()

    if req.pipeline_type == "market_only":
        run = await pipe.run_market(triggered_by="manual")
    elif req.pipeline_type == "news_only":
        run = await pipe.run_news_only(max_articles=req.max_articles, triggered_by="manual")
    else:
        run = await pipe.run_full(max_articles=req.max_articles, triggered_by="manual")

    return APIResponse(
        data=JobTriggerResponse(
            run_id=run.run_id,
            pipeline_type=run.pipeline_type,
            status=run.status.value,
            message=f"Pipeline {run.status.value} in {run.duration_s:.1f}s",
        ).model_dump(),
        message=f"Pipeline {run.pipeline_type} completed ({run.status.value})",
    )


@router.get("/history")
async def pipeline_history(limit: int = Query(20, ge=1, le=100)):
    """Get recent pipeline run history."""
    pipe = _get_pipeline()
    runs = pipe.recent_runs(limit)
    return APIResponse(
        data=[
            {
                "run_id": r.run_id,
                "pipeline_type": r.pipeline_type,
                "status": r.status.value,
                "triggered_by": r.triggered_by,
                "started_at": r.started_at.isoformat(),
                "finished_at": r.finished_at.isoformat() if r.finished_at else None,
                "articles_scraped": r.articles_scraped,
                "articles_processed": r.articles_processed,
                "articles_delivered": r.articles_delivered,
                "errors_count": len(r.errors),
                "duration_s": r.duration_s,
            }
            for r in runs
        ],
        message=f"{len(runs)} pipeline runs",
    )


@router.get("/runs/{run_id}")
async def get_pipeline_run(run_id: str):
    """Get detailed info about a specific pipeline run."""
    pipe = _get_pipeline()
    run = pipe.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")

    return APIResponse(
        data={
            "run_id": run.run_id,
            "pipeline_type": run.pipeline_type,
            "status": run.status.value,
            "triggered_by": run.triggered_by,
            "started_at": run.started_at.isoformat(),
            "finished_at": run.finished_at.isoformat() if run.finished_at else None,
            "articles_scraped": run.articles_scraped,
            "articles_processed": run.articles_processed,
            "articles_delivered": run.articles_delivered,
            "articles_deduplicated": run.articles_deduplicated,
            "errors": run.errors,
            "duration_s": run.duration_s,
            "stages": [
                {
                    "stage": s.stage.value,
                    "status": s.status,
                    "items_in": s.items_in,
                    "items_out": s.items_out,
                    "errors": s.errors,
                    "started_at": s.started_at.isoformat() if s.started_at else None,
                    "finished_at": s.finished_at.isoformat() if s.finished_at else None,
                }
                for s in run.stages
            ],
        },
        message=f"Run {run_id} details",
    )
