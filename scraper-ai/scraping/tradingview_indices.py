"""
TradingView Index Scraper
=========================

Utility for harvesting the latest index quotes from TradingView's public
indices overview page. Supports two modes:
1. Direct API ingestion (recommended) - Posts directly to the database via API
2. JSON file output (legacy) - Saves to a JSON file for manual ingestion

Usage
-----
# Direct API mode (recommended):
python tradingview_indices.py --api http://localhost:3000/api/market/ingest --api-key YOUR_KEY

# Legacy JSON mode:
python tradingview_indices.py --output ../../data/tradingview_indices.json --limit 50

# Combined mode (API + fallback JSON):
python tradingview_indices.py --api http://localhost:3000/api/market/ingest --output ../../data/tradingview_indices.json
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

import requests
from bs4 import BeautifulSoup, Tag
import re

INDEX_URL = "https://in.tradingview.com/markets/indices/quotes-all/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
DEFAULT_OUTPUT = Path(__file__).resolve().parents[2] / "data" / "tradingview_indices.json"

CURRENCY_PREFIX_MAP = {
    "US$": "USD",
    "CA$": "CAD",
    "C$": "CAD",
    "A$": "AUD",
    "AU$": "AUD",
    "NZ$": "NZD",
    "HK$": "HKD",
    "S$": "SGD",
    "$": "USD",
    "£": "GBP",
    "€": "EUR",
    "¥": "JPY",
    "CN¥": "CNY",
    "JP¥": "JPY",
    "₩": "KRW",
    "₹": "INR",
    "₱": "PHP",
    "₫": "VND",
    "₺": "TRY",
    "₦": "NGN",
    "₽": "RUB",
    "₨": "INR",
    "₪": "ILS",
    "₡": "CRC",
}


@dataclass
class IndexQuote:
    symbol: str
    name: str
    last: Optional[float]
    change: Optional[float]
    change_percent: Optional[float]
    high: Optional[float]
    low: Optional[float]
    currency: Optional[str]
    exchange: Optional[str]
    country: Optional[str]

    def to_serializable(self) -> dict:
        data = asdict(self)
        clean = {k: v for k, v in data.items() if v is not None}
        clean["source"] = "tradingview"
        return clean


class TradingViewIndexScraper:
    """Scrape the TradingView indices overview table."""

    def __init__(self, limit: Optional[int] = None) -> None:
        self.limit = limit
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"})

    def fetch_html(self) -> str:
        response = self.session.get(INDEX_URL, timeout=15)
        response.raise_for_status()
        return response.text

    def parse_rows(self, html: str) -> Iterable[IndexQuote]:
        soup = BeautifulSoup(html, "html.parser")
        table = soup.find("table")
        if table is None:
            raise RuntimeError("Could not locate indices table on TradingView page")

        body = table.find("tbody") or table
        rows = body.find_all("tr", recursive=False)
        count = 0

        for row in rows:
            if self.limit is not None and count >= self.limit:
                break

            quote = self._parse_row(row)
            if quote is None:
                continue

            count += 1
            yield quote

    def _parse_row(self, row: Tag) -> Optional[IndexQuote]:
        cells = row.find_all("td", recursive=False)
        if len(cells) < 4:
            return None

        symbol_attr = self._coerce_attr(row.get("data-symbol"))
        symbol = (symbol_attr or self._extract_symbol(cells[0])).upper()
        name = self._extract_name(cells[0]) or symbol
        if name.upper().startswith(symbol.upper()):
            trimmed = name[len(symbol):].strip(" -:\u2013\u2014")
            if trimmed:
                name = trimmed

        label_map = self._build_label_map(cells)

        price_text = self._get_by_labels(label_map, ["last", "price", "last price"], strip_percent=False)
        if price_text is None:
            price_text = self._cell_text(cells, 1)
        change_percent_text = self._get_by_labels(
            label_map, ["change %", "chg %", "change percent"], strip_percent=True
        )
        if change_percent_text is None:
            change_percent_text = self._cell_text(cells, 2)
        change_text = self._get_by_labels(label_map, ["change", "chg"], strip_percent=False)
        if change_text is None:
            change_text = self._cell_text(cells, 3)
        high_text = self._get_by_labels(label_map, ["high", "day high"], strip_percent=False)
        if high_text is None:
            high_text = self._cell_text(cells, 4)
        low_text = self._get_by_labels(label_map, ["low", "day low"], strip_percent=False)
        if low_text is None:
            low_text = self._cell_text(cells, 5)

        last = self._parse_float(price_text)
        change_percent = self._parse_float(change_percent_text)
        change = self._parse_float(change_text)
        high = self._parse_float(high_text)
        low = self._parse_float(low_text)

        currency = self._get_by_labels(label_map, ["currency", "curr"], numeric=False, strip_percent=False)
        if currency:
            currency = currency.strip().upper()
        if not currency:
            currency = self._extract_currency(price_text, high_text, low_text)

        exchange = self._get_by_labels(label_map, ["exchange", "exch"], numeric=False)
        country = self._get_by_labels(label_map, ["country", "region"], numeric=False)

        return IndexQuote(
            symbol=symbol,
            name=name,
            last=last,
            change=change,
            change_percent=change_percent,
            high=high,
            low=low,
            currency=currency,
            exchange=exchange,
            country=country,
        )

    def _extract_symbol(self, cell: Tag) -> str:
        anchor = cell.find("a")
        if anchor and anchor.text:
            return anchor.text.strip().split()[0]
        text = cell.get_text(" ", strip=True)
        return text.split(" ")[0]

    def _extract_name(self, cell: Tag) -> Optional[str]:
        span = cell.find("span")
        if span and span.text:
            return span.text.strip()
        text = cell.get_text(" ", strip=True)
        parts = text.split(" ", 1)
        return parts[1].strip() if len(parts) == 2 else None

    def _build_label_map(self, cells: List[Tag]) -> Dict[str, str]:
        label_map: Dict[str, str] = {}
        for cell in cells:
            label = self._coerce_attr(cell.get("data-label"))
            if not label:
                continue
            key = label.strip().lower()
            if not key:
                continue
            label_map[key] = cell.get_text(" ", strip=True)
        return label_map

    def _get_by_labels(
        self,
        label_map: Dict[str, str],
        labels: Sequence[str],
        *,
        numeric: bool = True,
        strip_percent: bool = True,
    ) -> Optional[str]:
        for label in labels:
            key = label.lower()
            if key in label_map:
                text = label_map[key]
                if strip_percent:
                    text = text.replace("%", "")
                text = text.strip()
                if numeric:
                    return text or None
                return text or None
        return None

    def _cell_text(self, cells: List[Tag], index: int) -> Optional[str]:
        if index >= len(cells):
            return None
        return cells[index].get_text(" ", strip=True)

    def _parse_float(self, value: Optional[str]) -> Optional[float]:
        if not value:
            return None

        normalized = (
            value.replace("−", "-")
            .replace("–", "-")
            .replace("—", "-")
            .replace("+", "")
            .replace("Â", "")
        )
        match = re.search(r"[-+]?\d+(?:,\d{3})*(?:\.\d+)?", normalized)
        if not match:
            return None
        number = match.group(0).replace(",", "")
        try:
            return float(number)
        except ValueError:
            return None

    def _coerce_attr(self, value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, (list, tuple)):
            return value[0] if value else None
        return str(value)

    def _extract_currency(self, *values: Optional[str]) -> Optional[str]:
        for raw in values:
            if not raw:
                continue
            text = raw.strip()
            if not text:
                continue
            for prefix, code in CURRENCY_PREFIX_MAP.items():
                if text.startswith(prefix):
                    return code
            suffix_match = re.search(r"(?:\s|^)([A-Z]{2,5})$", text)
            if suffix_match:
                return suffix_match.group(1)
        return None

    def run(self) -> List[IndexQuote]:
        html = self.fetch_html()
        return list(self.parse_rows(html))


def save_quotes(quotes: Iterable[IndexQuote], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_url": INDEX_URL,
        "items": [quote.to_serializable() for quote in quotes],
    }
    with destination.open("w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, indent=2)


def send_to_api(quotes: List[IndexQuote], api_url: str, api_key: Optional[str] = None) -> dict:
    """Send scraped quotes directly to the database via API."""
    items = [quote.to_serializable() for quote in quotes]
    
    payload = {
        "scraperName": "tradingview",
        "dataType": "indices",
        "items": items,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
    }
    
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    else:
        logger.warning("No API key provided for ingestion; requests will be unauthorized")
    
    response = requests.post(api_url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    
    return response.json()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scrape TradingView index quotes and ingest to database.")
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit the number of indices scraped (default: all rows on the page).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Path for the JSON snapshot (optional, for legacy mode or backup).",
    )
    parser.add_argument(
        "--api",
        type=str,
        default=None,
        help="API endpoint URL for direct database ingestion (e.g., http://localhost:3000/api/market/ingest).",
    )
    parser.add_argument(
        "--api-key",
        type=str,
        default=os.environ.get("MARKET_INGEST_API_KEY"),
        help="API key for authentication (defaults to MARKET_INGEST_API_KEY env var).",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    logger = logging.getLogger("tradingview-scraper")

    # Validate that at least one output method is specified
    if not args.api and not args.output:
        logger.info("No --api or --output specified. Defaulting to JSON output at %s", DEFAULT_OUTPUT)
        args.output = DEFAULT_OUTPUT

    scraper = TradingViewIndexScraper(limit=args.limit)
    try:
        quotes = scraper.run()
    except Exception as exc:  # noqa: BLE001 - surface exact failure for ops
        logger.error("Scraping failed: %s", exc)
        raise SystemExit(1) from exc

    logger.info("Scraped %d index quotes", len(quotes))

    # Send to API if configured (primary method)
    if args.api:
        try:
            result = send_to_api(quotes, args.api, args.api_key)
            stats = result.get("stats", {})
            logger.info(
                "API ingestion complete: %d inserted, %d failed",
                stats.get("inserted", 0),
                stats.get("failed", 0),
            )
            if stats.get("failedSymbols"):
                logger.warning("Failed symbols: %s", ", ".join(stats["failedSymbols"]))
        except Exception as exc:
            logger.error("API ingestion failed: %s", exc)
            # Fall through to save JSON as backup if output path is specified
            if not args.output:
                raise SystemExit(1) from exc
            logger.info("Falling back to JSON output...")

    # Save to JSON file (legacy method or backup)
    if args.output:
        save_quotes(quotes, args.output)
        logger.info("Saved %d index quotes to %s", len(quotes), args.output)

    logger.info("Done!")


if __name__ == "__main__":
    main()
