# services/content-engine/core/pipeline.py
"""Pipeline orchestrator — the heart of the Content Engine.

Coordinates: scraping → deduplication → AI processing → delivery.

Ported from ``scraper-ai/pipeline.py`` (NewsTRNTPipeline) with:
  - no direct DB writes (uses DeliveryService instead)
  - full pipeline-run tracking with ``PipelineRun`` model
  - stage-level timing and error capture
  - market-data pipeline support
  - re-processing support for existing articles
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from ai.classifier import TopicClassifier
from ai.seo_optimizer import SEOOptimizer
from ai.sentiment import SentimentAnalyzer
from ai.summarizer import Summarizer
from config import get_settings
from core.deduplication import Deduplicator
from core.delivery import DeliveryService
from models.pipeline import PipelineRun, PipelineStage, PipelineStatus, StageResult
from scraping.base import ScrapingResult
from scraping.newsapi_scraper import NewsAPIScraper
from scraping.rss_scraper import RSSScraper
from scraping.tradingview_scraper import TradingViewScraper
from utils.text_processing import reading_time

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """Runs end-to-end content pipelines and tracks every run."""

    def __init__(self) -> None:
        settings = get_settings()

        # Scrapers
        self.rss = RSSScraper()
        self.newsapi = NewsAPIScraper(api_key=settings.news_api_key)
        self.tradingview = TradingViewScraper()

        # AI
        self.summarizer = Summarizer()
        self.classifier = TopicClassifier()
        self.seo = SEOOptimizer()
        self.sentiment = SentimentAnalyzer()

        # Support
        self.dedup = Deduplicator()
        self.delivery = DeliveryService()

        # History
        self._history: List[PipelineRun] = []

    async def close(self) -> None:
        self.dedup.save_cache()
        await self.delivery.close()

    # ── Public pipelines ─────────────────────────────────────────────

    async def run_full(self, max_articles: int = 50, triggered_by: str = "scheduler") -> PipelineRun:
        """Full pipeline: scrape news → dedup → AI → deliver."""
        run = self._new_run("full", triggered_by)
        logger.info("Pipeline %s started (full, max=%d)", run.run_id, max_articles)

        try:
            # 1. Scraping
            stage = self._start_stage(PipelineStage.SCRAPING)
            raw = await self._scrape_all(max_articles)
            stage.items_in = 0
            stage.items_out = len(raw)
            self._finish_stage(stage)
            run.articles_scraped = len(raw)

            # 2. Deduplication
            stage = self._start_stage(PipelineStage.DEDUPLICATION)
            stage.items_in = len(raw)
            unique = self.dedup.filter(raw)
            stage.items_out = len(unique)
            run.articles_deduplicated = len(raw) - len(unique)
            self._finish_stage(stage)

            # 3. AI Processing
            stage = self._start_stage(PipelineStage.AI_PROCESSING)
            stage.items_in = len(unique)
            processed = await self._ai_process_batch(unique, stage)
            stage.items_out = len(processed)
            run.articles_processed = len(processed)
            self._finish_stage(stage)

            # 4. Delivery
            stage = self._start_stage(PipelineStage.DELIVERY)
            stage.items_in = len(processed)
            result = await self.delivery.deliver_articles(processed)
            stage.items_out = result.get("inserted", len(processed))
            run.articles_delivered = stage.items_out
            self._finish_stage(stage)

            run.status = PipelineStatus.SUCCESS

        except Exception as exc:
            logger.error("Pipeline %s failed: %s", run.run_id, exc)
            run.errors.append(str(exc))
            run.status = PipelineStatus.FAILED

        self._close_run(run)
        return run

    async def run_market(self, limit: int | None = None, triggered_by: str = "scheduler") -> PipelineRun:
        """Market-only pipeline: scrape TradingView → deliver."""
        run = self._new_run("market_only", triggered_by)
        logger.info("Pipeline %s started (market)", run.run_id)

        try:
            items = await self.tradingview.fetch_and_format(limit)
            run.articles_scraped = len(items)

            result = await self.delivery.deliver_market_data(items)
            run.articles_delivered = result.get("stats", {}).get("inserted", 0)
            run.status = PipelineStatus.SUCCESS

        except Exception as exc:
            logger.error("Market pipeline %s failed: %s", run.run_id, exc)
            run.errors.append(str(exc))
            run.status = PipelineStatus.FAILED

        self._close_run(run)
        return run

    async def run_news_only(self, max_articles: int = 50, triggered_by: str = "scheduler") -> PipelineRun:
        """News-only pipeline (no market data)."""
        return await self.run_full(max_articles=max_articles, triggered_by=triggered_by)

    # ── History ──────────────────────────────────────────────────────

    def recent_runs(self, limit: int = 20) -> List[PipelineRun]:
        return list(reversed(self._history[-limit:]))

    def get_run(self, run_id: str) -> Optional[PipelineRun]:
        for r in self._history:
            if r.run_id == run_id:
                return r
        return None

    # ── Internal: scraping ───────────────────────────────────────────

    async def _scrape_all(self, max_articles: int) -> List[ScrapingResult]:
        all_articles: List[ScrapingResult] = []

        rss_articles = await self.rss.fetch(max_per_source=5)
        all_articles.extend(rss_articles)

        newsapi_articles = await self.newsapi.fetch(max_articles=20)
        all_articles.extend(newsapi_articles)

        # Sort newest first and limit
        all_articles.sort(key=lambda a: a.published_at or datetime.min, reverse=True)
        return all_articles[:max_articles]

    # ── Internal: AI processing ──────────────────────────────────────

    async def _ai_process_batch(
        self, articles: List[ScrapingResult], stage: StageResult
    ) -> List[Dict[str, Any]]:
        processed: List[Dict[str, Any]] = []

        for i, art in enumerate(articles, 1):
            try:
                logger.info("AI processing %d/%d: %s", i, len(articles), art.title[:60])
                doc = await self._ai_process_one(art)
                processed.append(doc)
            except Exception as exc:
                stage.errors.append(f"{art.title[:40]}: {exc}")
                logger.error("AI processing error: %s", exc)

        return processed

    async def _ai_process_one(self, art: ScrapingResult) -> Dict[str, Any]:
        # Summarise
        summary = await self.summarizer.summarize(art.content)
        short = await self.summarizer.short_summary(art.content)

        # Classify
        cls = self.classifier.classify(art.title, art.content, summary)

        # SEO
        seo = self.seo.optimize(art.title, art.content, summary)

        # Sentiment
        sent = await self.sentiment.analyze(art.content)

        # Social & quotes (optional enrichment)
        social = await self.summarizer.social_posts(art.title, summary)
        quotes = await self.summarizer.extract_key_quotes(art.content)
        alt_headlines = await self.summarizer.headline_alternatives(art.title, art.content)

        return {
            "title": art.title,
            "slug": art.slug or seo.slug,
            "content": art.content,
            "summary": summary,
            "short_content": short,
            "excerpt": art.excerpt,
            "author": art.author,
            "source_name": art.source_name,
            "source_url": art.source_url,
            "image_url": art.image_url,
            "images": art.images,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "category_slug": cls.category,
            "reading_time": reading_time(art.content),
            "seo_title": seo.optimized_title,
            "seo_description": seo.optimized_meta_description,
            "seo_keywords": seo.keywords,
            "seo_score": seo.score,
            "sentiment_score": sent.score,
            "sentiment_label": sent.label,
            "social_posts": social,
            "key_quotes": quotes,
            "alt_headlines": alt_headlines,
            "ai_metadata": {
                "confidence_score": cls.confidence,
                "seo_score": seo.score,
                "readability_score": seo.readability_score,
                "processing_timestamp": datetime.utcnow().isoformat(),
                "engine_version": "2.0",
            },
            "meta_data": art.meta_data,
        }

    # ── Run lifecycle ────────────────────────────────────────────────

    def _new_run(self, pipeline_type: str, triggered_by: str) -> PipelineRun:
        run = PipelineRun(
            run_id=uuid.uuid4().hex[:12],
            pipeline_type=pipeline_type,
            triggered_by=triggered_by,
            status=PipelineStatus.RUNNING,
        )
        self._history.append(run)
        # Keep history bounded
        if len(self._history) > 200:
            self._history = self._history[-100:]
        return run

    @staticmethod
    def _start_stage(stage_name: PipelineStage) -> StageResult:
        return StageResult(stage=stage_name, status="running", started_at=datetime.utcnow())

    @staticmethod
    def _finish_stage(stage: StageResult) -> None:
        stage.finished_at = datetime.utcnow()
        stage.status = "error" if stage.errors else "success"

    @staticmethod
    def _close_run(run: PipelineRun) -> None:
        run.finished_at = datetime.utcnow()
        run.duration_s = (run.finished_at - run.started_at).total_seconds()
        logger.info(
            "Pipeline %s finished (%s) in %.1fs — scraped=%d processed=%d delivered=%d errors=%d",
            run.run_id,
            run.status.value,
            run.duration_s,
            run.articles_scraped,
            run.articles_processed,
            run.articles_delivered,
            len(run.errors),
        )
