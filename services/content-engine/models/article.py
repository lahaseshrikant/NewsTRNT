# services/content-engine/models/article.py
"""Pydantic models for articles flowing through the pipeline."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class RawArticle(BaseModel):
    """Article as received from a scraping source (pre-AI)."""

    source_url: str
    title: str
    content: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    image_url: Optional[str] = None
    source_name: str = ""
    source_type: str = "rss"  # rss | newsapi | custom


class AIEnrichment(BaseModel):
    """Fields produced by the AI processing pipeline."""

    summary: Optional[str] = None
    short_summary: Optional[str] = None
    category: Optional[str] = None
    category_confidence: float = 0.0
    keywords: list[str] = Field(default_factory=list)
    sentiment_score: float = 0.0  # -1.0 … +1.0
    sentiment_label: str = "neutral"  # positive | negative | neutral | mixed
    fact_check_status: str = "unverified"  # verified | disputed | unverified
    seo_score: float = 0.0
    seo_slug: str = ""
    meta_description: str = ""
    readability_score: float = 0.0
    alt_headlines: list[str] = Field(default_factory=list)
    key_quotes: list[str] = Field(default_factory=list)
    social_posts: dict = Field(default_factory=dict)
    schema_markup: dict = Field(default_factory=dict)


class ProcessedArticle(BaseModel):
    """Fully processed article ready for delivery to admin-backend."""

    source_url: str
    title: str
    content: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    image_url: Optional[str] = None
    source_name: str = ""
    source_type: str = "rss"

    # AI enrichment
    summary: Optional[str] = None
    short_summary: Optional[str] = None
    category: Optional[str] = None
    category_confidence: float = 0.0
    keywords: list[str] = Field(default_factory=list)
    sentiment_score: float = 0.0
    sentiment_label: str = "neutral"
    fact_check_status: str = "unverified"
    seo_score: float = 0.0
    seo_slug: str = ""
    meta_description: str = ""
    readability_score: float = 0.0
    alt_headlines: list[str] = Field(default_factory=list)
    key_quotes: list[str] = Field(default_factory=list)
    social_posts: dict = Field(default_factory=dict)
    schema_markup: dict = Field(default_factory=dict)


class ArticleDeliveryPayload(BaseModel):
    """Payload sent to admin-backend for article ingestion."""

    source: str = "content-engine"
    articles: list[ProcessedArticle]


class SummarizeRequest(BaseModel):
    """Request body for /ai/summarize."""

    content: str
    max_length: int = 200
    style: str = "comprehensive"  # comprehensive | short | bullet


class ClassifyRequest(BaseModel):
    """Request body for /ai/classify."""

    title: str
    content: str
    summary: str = ""


class SentimentRequest(BaseModel):
    """Request body for /ai/sentiment."""

    text: str
    granularity: str = "document"  # document | sentence | entity


class SEORequest(BaseModel):
    """Request body for /ai/seo-optimize."""

    title: str
    content: str
    summary: str = ""


class FullProcessRequest(BaseModel):
    """Request body for /ai/process (full pipeline)."""

    title: str
    content: str
    operations: list[str] = Field(
        default_factory=lambda: ["summarize", "classify", "seo", "sentiment"]
    )
