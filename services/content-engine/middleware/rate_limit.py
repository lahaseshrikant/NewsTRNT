# services/content-engine/middleware/rate_limit.py
"""Simple in-memory rate limiter (swap for Redis in production)."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Dict, Tuple

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Token-bucket rate limiter keyed by client IP."""

    def __init__(self, requests_per_minute: int = 60):
        self.rpm = requests_per_minute
        self._buckets: Dict[str, Tuple[float, int]] = defaultdict(lambda: (time.time(), 0))

    def _client_key(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def __call__(self, request: Request) -> None:
        key = self._client_key(request)
        window_start, count = self._buckets[key]
        now = time.time()

        # Reset window after 60 s
        if now - window_start > 60:
            self._buckets[key] = (now, 1)
            return

        if count >= self.rpm:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {self.rpm} requests/min.",
            )

        self._buckets[key] = (window_start, count + 1)
