# services/content-engine/scraping/tradingview_scraper.py
"""TradingView market indices scraper.

Ported from ``scraper-ai/scraping/tradingview_indices.py`` with:
  - async wrapper around synchronous requests (TradingView blocks aiohttp)
  - result expressed as ``MarketIndex`` models
  - integrated into the unified scraper interface
"""

from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Sequence

import requests
from bs4 import BeautifulSoup, Tag

logger = logging.getLogger(__name__)

INDEX_URL = "https://in.tradingview.com/markets/indices/quotes-all/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

CURRENCY_PREFIX_MAP: Dict[str, str] = {
    "US$": "USD", "CA$": "CAD", "C$": "CAD", "A$": "AUD", "AU$": "AUD",
    "NZ$": "NZD", "HK$": "HKD", "S$": "SGD", "$": "USD", "£": "GBP",
    "€": "EUR", "¥": "JPY", "CN¥": "CNY", "JP¥": "JPY", "₩": "KRW",
    "₹": "INR", "₱": "PHP", "₫": "VND", "₺": "TRY", "₦": "NGN",
    "₽": "RUB", "₨": "INR", "₪": "ILS", "₡": "CRC",
}


@dataclass
class IndexQuote:
    symbol: str
    name: str
    last: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    currency: Optional[str] = None
    exchange: Optional[str] = None
    country: Optional[str] = None

    def to_dict(self) -> dict:
        d = {k: v for k, v in asdict(self).items() if v is not None}
        d["source"] = "tradingview"
        return d


class TradingViewScraper:
    """Scrape TradingView indices overview table.

    Uses synchronous ``requests`` because TradingView blocks many async UA strings.
    Wrapped in ``asyncio.to_thread`` for non-blocking calls from FastAPI.
    """

    def __init__(self, limit: int | None = None) -> None:
        self.limit = limit
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"})

    # ── public async API ─────────────────────────────────────────────

    async def fetch(self, limit: int | None = None) -> List[IndexQuote]:
        """Fetch index quotes (runs the synchronous I/O in a thread)."""
        effective_limit = limit or self.limit
        return await asyncio.to_thread(self._fetch_sync, effective_limit)

    async def fetch_and_format(self, limit: int | None = None) -> List[dict]:
        """Fetch and convert to serialisable dicts for API delivery."""
        quotes = await self.fetch(limit)
        return [q.to_dict() for q in quotes]

    # ── synchronous core ─────────────────────────────────────────────

    def _fetch_sync(self, limit: int | None = None) -> List[IndexQuote]:
        html = self._session.get(INDEX_URL, timeout=15).text
        return list(self._parse_rows(html, limit))

    def _parse_rows(self, html: str, limit: int | None = None) -> Iterable[IndexQuote]:
        soup = BeautifulSoup(html, "html.parser")
        table = soup.find("table")
        if table is None:
            raise RuntimeError("TradingView indices table not found")

        body = table.find("tbody") or table
        rows = body.find_all("tr", recursive=False)
        count = 0

        for row in rows:
            if limit is not None and count >= limit:
                break
            quote = self._parse_row(row)
            if quote:
                count += 1
                yield quote

    def _parse_row(self, row: Tag) -> Optional[IndexQuote]:
        cells = row.find_all("td", recursive=False)
        if len(cells) < 4:
            return None

        symbol = (self._attr(row.get("data-symbol")) or self._extract_symbol(cells[0])).upper()
        name = self._extract_name(cells[0]) or symbol
        if name.upper().startswith(symbol.upper()):
            trimmed = name[len(symbol):].strip(" -:\u2013\u2014")
            if trimmed:
                name = trimmed

        lm = self._label_map(cells)

        price_text = self._by_labels(lm, ["last", "price", "last price"]) or self._cell(cells, 1)
        chg_pct_text = self._by_labels(lm, ["change %", "chg %", "change percent"], strip_pct=True) or self._cell(cells, 2)
        chg_text = self._by_labels(lm, ["change", "chg"]) or self._cell(cells, 3)
        high_text = self._by_labels(lm, ["high", "day high"]) or self._cell(cells, 4)
        low_text = self._by_labels(lm, ["low", "day low"]) or self._cell(cells, 5)

        currency = self._by_labels(lm, ["currency", "curr"], numeric=False)
        if currency:
            currency = currency.strip().upper()
        if not currency:
            currency = self._guess_currency(price_text, high_text, low_text)

        return IndexQuote(
            symbol=symbol,
            name=name,
            last=self._float(price_text),
            change=self._float(chg_text),
            change_percent=self._float(chg_pct_text),
            high=self._float(high_text),
            low=self._float(low_text),
            currency=currency,
            exchange=self._by_labels(lm, ["exchange", "exch"], numeric=False),
            country=self._by_labels(lm, ["country", "region"], numeric=False),
        )

    # ── HTML helpers ─────────────────────────────────────────────────

    @staticmethod
    def _extract_symbol(cell: Tag) -> str:
        a = cell.find("a")
        if a and a.text:
            return a.text.strip().split()[0]
        return cell.get_text(" ", strip=True).split(" ")[0]

    @staticmethod
    def _extract_name(cell: Tag) -> Optional[str]:
        span = cell.find("span")
        if span and span.text:
            return span.text.strip()
        parts = cell.get_text(" ", strip=True).split(" ", 1)
        return parts[1].strip() if len(parts) == 2 else None

    @staticmethod
    def _label_map(cells: List[Tag]) -> Dict[str, str]:
        m: Dict[str, str] = {}
        for c in cells:
            raw = c.get("data-label")
            if raw is None:
                continue
            key = (raw[0] if isinstance(raw, list) else str(raw)).strip().lower()
            if key:
                m[key] = c.get_text(" ", strip=True)
        return m

    @staticmethod
    def _by_labels(
        m: Dict[str, str],
        labels: Sequence[str],
        *,
        numeric: bool = True,
        strip_pct: bool = False,
    ) -> Optional[str]:
        for label in labels:
            text = m.get(label.lower())
            if text:
                if strip_pct:
                    text = text.replace("%", "")
                return text.strip() or None
        return None

    @staticmethod
    def _cell(cells: List[Tag], idx: int) -> Optional[str]:
        return cells[idx].get_text(" ", strip=True) if idx < len(cells) else None

    @staticmethod
    def _float(val: Optional[str]) -> Optional[float]:
        if not val:
            return None
        norm = val.replace("−", "-").replace("–", "-").replace("—", "-").replace("+", "").replace("Â", "")
        match = re.search(r"[-+]?\d+(?:,\d{3})*(?:\.\d+)?", norm)
        if not match:
            return None
        try:
            return float(match.group(0).replace(",", ""))
        except ValueError:
            return None

    @staticmethod
    def _attr(value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, (list, tuple)):
            return value[0] if value else None
        return str(value)

    @staticmethod
    def _guess_currency(*vals: Optional[str]) -> Optional[str]:
        for raw in vals:
            if not raw:
                continue
            text = raw.strip()
            for prefix, code in CURRENCY_PREFIX_MAP.items():
                if text.startswith(prefix):
                    return code
            match = re.search(r"(?:\s|^)([A-Z]{2,5})$", text)
            if match:
                return match.group(1)
        return None
