# services/content-engine/scraping/base.py
"""Base scraper interface and shared data types."""

from __future__ import annotations

import hashlib
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from bs4 import BeautifulSoup


@dataclass
class ScrapingResult:
    """Unified output of any scraper."""

    title: str
    content: str
    source_url: str
    source_name: str
    source_type: str  # rss | newsapi | tradingview | custom
    slug: str = ""
    excerpt: str = ""
    author: str = "Unknown"
    published_at: Optional[datetime] = None
    image_url: str = ""
    images: List[str] = field(default_factory=list)
    meta_data: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.slug:
            self.slug = generate_slug(self.title)
        if not self.excerpt:
            self.excerpt = self.content[:200] + "..." if len(self.content) > 200 else self.content


class BaseScraper(ABC):
    """All scrapers extend this base class."""

    name: str = "base"

    @abstractmethod
    async def fetch(self, **kwargs: Any) -> List[ScrapingResult]:
        """Fetch articles and return a list of ``ScrapingResult``."""
        ...


# ── Shared helpers ───────────────────────────────────────────────────

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug with uniqueness hash."""
    slug = re.sub(r"[^a-zA-Z0-9\s]", "", title.lower())
    slug = re.sub(r"\s+", "-", slug.strip())[:100]
    h = hashlib.md5(title.encode()).hexdigest()[:8]
    return f"{slug}-{h}"


def clean_html(raw: str) -> str:
    """Strip HTML tags and collapse whitespace."""
    if not raw:
        return ""
    text = BeautifulSoup(raw, "html.parser").get_text()
    text = re.sub(r"\s+", " ", text).strip()
    for phrase in [
        "Click here to read more",
        "Continue reading",
        "Read the full article",
        "Subscribe to our newsletter",
    ]:
        text = text.replace(phrase, "")
    return text.strip()


def content_hash(title: str) -> str:
    """MD5 hash of lowercased title — used for deduplication."""
    return hashlib.md5(title.lower().encode()).hexdigest()
