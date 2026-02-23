# services/content-engine/core/delivery.py
"""Deliver processed articles and market data to admin-backend via API.

Replaces the old approach of writing directly to the database.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from config import get_settings
from utils.http_client import HttpClient

logger = logging.getLogger(__name__)


class DeliveryService:
    """Push content to admin-backend over HTTP."""

    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.admin_backend_url.rstrip("/")
        # note: admin-backend expects CONTENT_ENGINE_API_KEY in bearer token
        # ENGINE_API_KEY is for auth when the backend calls the engine itself
        self._api_key = settings.content_engine_api_key or settings.engine_api_key
        self._client = HttpClient(
            base_url=self._base_url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._api_key}",
            },
        )

    async def close(self) -> None:
        await self._client.close()

    # ── Articles ─────────────────────────────────────────────────────

    async def deliver_articles(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """POST processed articles to admin-backend /api/articles/ingest."""
        if not articles:
            return {"delivered": 0}

        payload = {
            "source": "content-engine",
            "articles": articles,
        }
        
        logger.debug("Posting articles payload: %s", payload)
        result = await self._client.post_json("/api/articles/ingest", payload)
        if not result:
            logger.warning("Article delivery returned empty response")
        delivered = result.get("inserted", len(articles))
        logger.warning("Delivered %d articles to admin-backend", delivered)
        return result

    # ── Market data ──────────────────────────────────────────────────

    async def deliver_market_data(self, items: List[dict], region: str = "us") -> Dict[str, Any]:
        """POST market index quotes to admin-backend /api/market/ingest."""
        if not items:
            return {"delivered": 0}

        payload = {
            "scraperName": "content-engine",
            "dataType": "indices",
            "items": items,
        }
        print(f"Delivering market data payload: {payload}")
        logger.debug("Posting market payload: %s", payload)
        result = await self._client.post_json("/api/market/ingest", payload)
        if not result:
            logger.warning("Market delivery returned empty response")
        logger.warning(
            "Market delivery: %d inserted, %d failed",
            result.get("inserted", 0),
            result.get("failed", 0),
        )
        return result

    # ── Health ping ──────────────────────────────────────────────────

    async def ping_admin(self) -> bool:
        """Check whether admin-backend is reachable."""
        try:
            async with await self._client.get("/api/health") as resp:
                return resp.status == 200
        except Exception:
            return False
