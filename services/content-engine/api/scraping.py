# services/content-engine/api/scraping.py
"""Scraping API routes — manage sources, trigger scrapes, view results."""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query

from middleware.auth import verify_api_key
from models.responses import APIResponse, ScrapingStatusResponse
from scraping.rss_scraper import DEFAULT_RSS_SOURCES, RSSScraper
from scraping.newsapi_scraper import NewsAPIScraper
from scraping.tradingview_scraper import TradingViewScraper
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scraping", tags=["scraping"])


@router.get("/sources", response_model=ScrapingStatusResponse)
async def list_sources():
    """List all configured scraping sources and their statuses."""
    settings = get_settings()
    sources = []

    for src in DEFAULT_RSS_SOURCES:
        sources.append({
            "name": src["name"],
            "url": src["url"],
            "type": "rss",
            "active": True,
        })

    sources.append({
        "name": "NewsAPI",
        "url": "https://newsapi.org/v2",
        "type": "newsapi",
        "active": bool(settings.news_api_key),
    })

    sources.append({
        "name": "TradingView",
        "url": "https://in.tradingview.com/markets/indices",
        "type": "tradingview",
        "active": True,
    })

    return ScrapingStatusResponse(
        total_sources=len(sources),
        active_sources=sum(1 for s in sources if s["active"]),
        sources=sources,
    )


@router.post("/rss", dependencies=[Depends(verify_api_key)])
async def trigger_rss_scrape(
    max_per_source: int = Query(5, ge=1, le=50),
):
    """Trigger an RSS scrape and return raw articles (without AI processing)."""
    scraper = RSSScraper()
    articles = await scraper.fetch(max_per_source=max_per_source)
    return APIResponse(
        data={
            "count": len(articles),
            "articles": [
                {
                    "title": a.title,
                    "source_name": a.source_name,
                    "source_url": a.source_url,
                    "published_at": str(a.published_at),
                    "word_count": len(a.content.split()),
                }
                for a in articles
            ],
        },
        message=f"Scraped {len(articles)} articles from RSS feeds",
    )


@router.post("/newsapi", dependencies=[Depends(verify_api_key)])
async def trigger_newsapi_scrape(
    max_articles: int = Query(20, ge=1, le=100),
):
    """Trigger a NewsAPI scrape and return raw articles."""
    settings = get_settings()
    scraper = NewsAPIScraper(api_key=settings.news_api_key)
    articles = await scraper.fetch(max_articles=max_articles)
    return APIResponse(
        data={
            "count": len(articles),
            "articles": [
                {
                    "title": a.title,
                    "source_name": a.source_name,
                    "source_url": a.source_url,
                    "published_at": str(a.published_at),
                }
                for a in articles
            ],
        },
        message=f"Scraped {len(articles)} articles from NewsAPI",
    )


@router.post("/market", dependencies=[Depends(verify_api_key)])
async def trigger_market_scrape(
    limit: int = Query(50, ge=1, le=500),
):
    """Trigger a TradingView market data scrape."""
    scraper = TradingViewScraper(limit=limit)
    quotes = await scraper.fetch_and_format()
    return APIResponse(
        data={
            "count": len(quotes),
            "sample": quotes[:5],
        },
        message=f"Scraped {len(quotes)} market indices",
    )
