# services/content-engine/scraping/rss_scraper.py
"""RSS feed scraper — fetches articles from configurable RSS sources.

Ported from ``scraper-ai/scraping/fetch_news.py`` (RSS portion) with:
  - async aiohttp fetching
  - configurable source list
  - image extraction from media:content / media:thumbnail / inline HTML
  - 7-day freshness filter
  - minimum word-count filter
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List

import aiohttp
import feedparser
from bs4 import BeautifulSoup, Tag

from .base import BaseScraper, ScrapingResult, clean_html

logger = logging.getLogger(__name__)

# Default RSS sources
DEFAULT_RSS_SOURCES: List[Dict[str, str]] = [
    {"name": "BBC News", "url": "http://feeds.bbci.co.uk/news/rss.xml"},
    {"name": "CNN", "url": "http://rss.cnn.com/rss/edition.rss"},
    {"name": "Reuters", "url": "https://feeds.reuters.com/reuters/topNews"},
    {"name": "TechCrunch", "url": "https://feeds.feedburner.com/TechCrunch"},
    {"name": "The Guardian", "url": "https://www.theguardian.com/world/rss"},
    {"name": "Associated Press", "url": "https://feeds.apnews.com/rss/apf-topnews"},
    {"name": "NPR", "url": "https://feeds.npr.org/1001/rss.xml"},
    {"name": "Ars Technica", "url": "http://feeds.arstechnica.com/arstechnica/index"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml"},
]


class RSSScraper(BaseScraper):
    """Asynchronously scrape multiple RSS feeds."""

    name = "rss"

    def __init__(
        self,
        sources: List[Dict[str, str]] | None = None,
        max_age_days: int = 7,
        min_words: int = 50,
    ) -> None:
        self.sources = sources or DEFAULT_RSS_SOURCES
        self.max_age = timedelta(days=max_age_days)
        self.min_words = min_words

    async def fetch(self, max_per_source: int = 10, **kwargs: Any) -> List[ScrapingResult]:
        articles: List[ScrapingResult] = []
        timeout = aiohttp.ClientTimeout(total=30)

        async with aiohttp.ClientSession(timeout=timeout) as session:
            for src in self.sources:
                try:
                    logger.info("Fetching RSS from %s", src["name"])
                    async with session.get(src["url"]) as resp:
                        if resp.status != 200:
                            logger.warning("%s returned %s", src["name"], resp.status)
                            continue
                        raw = await resp.text()

                    feed = feedparser.parse(raw)
                    for entry in feed.entries[:max_per_source]:
                        article = self._parse_entry(entry, src)
                        if article:
                            articles.append(article)

                except Exception as exc:
                    logger.error("Error fetching %s: %s", src["name"], exc)

        logger.info("RSS scraper collected %d articles from %d feeds", len(articles), len(self.sources))
        return articles

    # ── internal ─────────────────────────────────────────────────────

    def _parse_entry(self, entry: Any, source: Dict[str, str]) -> ScrapingResult | None:
        # Published date
        pub_date = self._parse_date(entry)
        if pub_date and pub_date < datetime.utcnow() - self.max_age:
            return None

        # Content
        content = ""
        if hasattr(entry, "content") and entry.content:
            content = entry.content[0].value
        elif hasattr(entry, "summary"):
            content = entry.summary
        elif hasattr(entry, "description"):
            content = entry.description
        content = clean_html(content)

        if len(content.split()) < self.min_words:
            return None

        return ScrapingResult(
            title=entry.get("title", "Untitled"),
            content=content,
            source_url=entry.get("link", ""),
            source_name=source["name"],
            source_type="rss",
            author=getattr(entry, "author", "Unknown"),
            published_at=pub_date or datetime.utcnow(),
            image_url=self._extract_image(entry),
            meta_data={"source_type": "rss", "feed_url": source["url"]},
        )

    @staticmethod
    def _parse_date(entry: Any) -> datetime | None:
        for attr in ("published_parsed", "updated_parsed"):
            parsed = getattr(entry, attr, None)
            if parsed:
                try:
                    return datetime(*parsed[:6])
                except Exception:
                    pass
        return None

    @staticmethod
    def _extract_image(entry: Any) -> str:
        if hasattr(entry, "media_content") and entry.media_content:
            return entry.media_content[0].get("url", "")
        if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            return entry.media_thumbnail[0].get("url", "")
        if hasattr(entry, "links"):
            for link in entry.links:
                if link.get("type", "").startswith("image/"):
                    return link.get("href", "")
        if hasattr(entry, "content") and entry.content:
            soup = BeautifulSoup(entry.content[0].value, "html.parser")
            img = soup.find("img")
            if img and isinstance(img, Tag) and img.get("src"):
                return str(img["src"])
        return ""
