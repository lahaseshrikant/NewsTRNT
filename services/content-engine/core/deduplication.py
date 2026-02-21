# services/content-engine/core/deduplication.py
"""Content deduplication — prevent duplicate articles from entering the DB.

Uses MD5 of lowercased title as the primary key; keeps an in-memory set
that is populated at startup from the admin-backend or a local cache file.
"""

from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path
from typing import List, Set

from scraping.base import ScrapingResult

logger = logging.getLogger(__name__)

CACHE_PATH = Path(__file__).resolve().parent.parent / "data" / "seen_hashes.json"


class Deduplicator:
    """In-memory + file-backed deduplication layer."""

    def __init__(self) -> None:
        self._seen: Set[str] = set()
        self._load_cache()

    # ── public ───────────────────────────────────────────────────────

    def is_duplicate(self, title: str) -> bool:
        return self._hash(title) in self._seen

    def mark_seen(self, title: str) -> None:
        self._seen.add(self._hash(title))

    def filter(self, articles: List[ScrapingResult]) -> List[ScrapingResult]:
        """Remove duplicates and mark new items as seen."""
        unique: List[ScrapingResult] = []
        for art in articles:
            if not self.is_duplicate(art.title):
                self.mark_seen(art.title)
                unique.append(art)
        removed = len(articles) - len(unique)
        if removed:
            logger.info("Deduplication removed %d / %d articles", removed, len(articles))
        return unique

    def save_cache(self) -> None:
        try:
            CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            # Keep only last 50 000 hashes to avoid unbounded growth
            hashes = list(self._seen)[-50_000:]
            CACHE_PATH.write_text(json.dumps(hashes), encoding="utf-8")
            logger.debug("Saved %d hashes to cache", len(hashes))
        except Exception as exc:
            logger.warning("Could not save dedup cache: %s", exc)

    # ── internal ─────────────────────────────────────────────────────

    def _load_cache(self) -> None:
        if CACHE_PATH.exists():
            try:
                data = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
                self._seen = set(data)
                logger.info("Loaded %d hashes from dedup cache", len(self._seen))
            except Exception as exc:
                logger.warning("Could not load dedup cache: %s", exc)

    @staticmethod
    def _hash(title: str) -> str:
        return hashlib.md5(title.lower().strip().encode()).hexdigest()
