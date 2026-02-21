# services/content-engine/scraping/__init__.py
"""Scraping package — RSS feeds, NewsAPI, TradingView, and base abstractions."""

from .base import BaseScraper, ScrapingResult
from .rss_scraper import RSSScraper
from .newsapi_scraper import NewsAPIScraper
from .tradingview_scraper import TradingViewScraper

__all__ = [
    "BaseScraper",
    "ScrapingResult",
    "RSSScraper",
    "NewsAPIScraper",
    "TradingViewScraper",
]
