# services/content-engine/models/market.py
"""Pydantic models for market data processing."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MarketIndex(BaseModel):
    """Single market index quote from TradingView or provider."""

    symbol: str
    name: str
    price: float
    change: float = 0.0
    change_percent: float = 0.0
    volume: Optional[float] = None
    market_cap: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    exchange: str = ""
    currency: str = "USD"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MarketSnapshot(BaseModel):
    """Collection of market indices at a single point in time."""

    indices: list[MarketIndex]
    source: str = "tradingview"
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    region: str = "us"


class MarketIngestPayload(BaseModel):
    """Payload format when delivering market data to admin-backend."""

    source: str = "content-engine"
    data: list[dict]
    region: str = "us"
    timestamp: str = ""


class TradingViewConfig(BaseModel):
    """Configuration for TradingView scraper."""

    headless: bool = True
    timeout_ms: int = 30000
    regions: list[str] = Field(default_factory=lambda: ["us"])
    indices: list[str] = Field(default_factory=list)
    retry_count: int = 2
    retry_delay_s: float = 5.0
