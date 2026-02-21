"""Data models package — Pydantic schemas for articles, market data, pipeline runs, and API responses."""

from .article import (
    AIEnrichment,
    ArticleDeliveryPayload,
    ClassifyRequest,
    FullProcessRequest,
    ProcessedArticle,
    RawArticle,
    SEORequest,
    SentimentRequest,
    SummarizeRequest,
)
from .market import (
    MarketIndex,
    MarketIngestPayload,
    MarketSnapshot,
    TradingViewConfig,
)
from .pipeline import (
    PipelineRun,
    PipelineRunSummary,
    PipelineStage,
    PipelineStatus,
    ScheduledJob,
    SchedulerStatus,
    ScheduleType,
    StageResult,
)
from .responses import (
    AIStatusResponse,
    APIResponse,
    ErrorResponse,
    HealthResponse,
    JobTriggerResponse,
    PaginatedResponse,
    ScrapingStatusResponse,
    StatusResponse,
)

__all__ = [
    "RawArticle", "AIEnrichment", "ProcessedArticle", "ArticleDeliveryPayload",
    "SummarizeRequest", "ClassifyRequest", "SentimentRequest", "SEORequest", "FullProcessRequest",
    "MarketIndex", "MarketSnapshot", "MarketIngestPayload", "TradingViewConfig",
    "PipelineStage", "PipelineStatus", "StageResult", "PipelineRun", "PipelineRunSummary",
    "ScheduleType", "ScheduledJob", "SchedulerStatus",
    "APIResponse", "ErrorResponse", "PaginatedResponse", "HealthResponse",
    "StatusResponse", "JobTriggerResponse", "ScrapingStatusResponse", "AIStatusResponse",
]
