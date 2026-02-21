# services/content-engine/scraping/newsapi_scraper.py
"""NewsAPI.org scraper — top headlines & everything search.

Ported from ``scraper-ai/scraping/fetch_news.py`` (NewsAPI portion).
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiohttp

from .base import BaseScraper, ScrapingResult, clean_html

logger = logging.getLogger(__name__)

NEWSAPI_BASE = "https://newsapi.org/v2"


class NewsAPIScraper(BaseScraper):
    """Fetch articles from newsapi.org."""

    name = "newsapi"

    def __init__(self, api_key: str = "", max_age_days: int = 7, min_words: int = 50) -> None:
        self.api_key = api_key
        self.max_age = timedelta(days=max_age_days)
        self.min_words = min_words

    async def fetch(self, max_articles: int = 20, **kwargs: Any) -> List[ScrapingResult]:
        if not self.api_key:
            logger.warning("NewsAPI key not set — skipping")
            return []

        articles: List[ScrapingResult] = []
        timeout = aiohttp.ClientTimeout(total=30)

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                params = {
                    "apiKey": self.api_key,
                    "language": "en",
                    "pageSize": str(max_articles),
                    "sortBy": "publishedAt",
                }
                async with session.get(f"{NEWSAPI_BASE}/top-headlines", params=params) as resp:
                    if resp.status != 200:
                        logger.error("NewsAPI returned %s", resp.status)
                        return []
                    data = await resp.json()

            for item in data.get("articles", []):
                article = self._parse_item(item)
                if article:
                    articles.append(article)

            logger.info("NewsAPI returned %d articles", len(articles))
        except Exception as exc:
            logger.error("NewsAPI error: %s", exc)

        return articles

    async def search(self, query: str, max_articles: int = 20) -> List[ScrapingResult]:
        """Search everything endpoint for a specific query."""
        if not self.api_key:
            return []

        articles: List[ScrapingResult] = []
        timeout = aiohttp.ClientTimeout(total=30)

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                params = {
                    "apiKey": self.api_key,
                    "q": query,
                    "language": "en",
                    "pageSize": str(max_articles),
                    "sortBy": "relevancy",
                }
                async with session.get(f"{NEWSAPI_BASE}/everything", params=params) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()

            for item in data.get("articles", []):
                article = self._parse_item(item)
                if article:
                    articles.append(article)
        except Exception as exc:
            logger.error("NewsAPI search error: %s", exc)

        return articles

    # ── internal ─────────────────────────────────────────────────────

    def _parse_item(self, item: Dict[str, Any]) -> Optional[ScrapingResult]:
        content = item.get("content", "")
        if not content or content == "[Removed]":
            return None

        content = clean_html(content)
        if len(content.split()) < self.min_words:
            return None

        pub_str = item.get("publishedAt", "")
        pub_date: Optional[datetime] = None
        if pub_str:
            try:
                pub_date = datetime.fromisoformat(pub_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pub_date = datetime.utcnow()

        if pub_date and pub_date < datetime.utcnow() - self.max_age:
            return None

        return ScrapingResult(
            title=item.get("title", "Untitled"),
            content=content,
            source_url=item.get("url", ""),
            source_name=item.get("source", {}).get("name", "NewsAPI"),
            source_type="newsapi",
            author=item.get("author", "Unknown") or "Unknown",
            published_at=pub_date or datetime.utcnow(),
            image_url=item.get("urlToImage", "") or "",
            excerpt=item.get("description", "")[:200] if item.get("description") else "",
            meta_data={"source_type": "newsapi", "api_version": "v2"},
        )
