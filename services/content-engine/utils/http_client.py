# services/content-engine/utils/http_client.py
"""Reusable async HTTP client with retry, timeout, and header defaults."""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import aiohttp

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = aiohttp.ClientTimeout(total=30, connect=10)


class HttpClient:
    """Thin aiohttp wrapper used by delivery and scraping modules."""

    def __init__(
        self,
        base_url: str = "",
        headers: Dict[str, str] | None = None,
        timeout: aiohttp.ClientTimeout = DEFAULT_TIMEOUT,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.default_headers = headers or {}
        self.timeout = timeout
        self._session: Optional[aiohttp.ClientSession] = None

    async def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=self.timeout,
                headers=self.default_headers,
            )
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()
            self._session = None

    async def get(self, path: str, **kwargs: Any) -> aiohttp.ClientResponse:
        session = await self._ensure_session()
        url = f"{self.base_url}{path}" if self.base_url else path
        return await session.get(url, **kwargs)

    async def post(self, path: str, **kwargs: Any) -> aiohttp.ClientResponse:
        session = await self._ensure_session()
        url = f"{self.base_url}{path}" if self.base_url else path
        return await session.post(url, **kwargs)

    async def post_json(self, path: str, data: dict, extra_headers: Dict[str, str] | None = None) -> dict:
        """POST JSON and return parsed response body (or {} on failure)."""
        session = await self._ensure_session()
        url = f"{self.base_url}{path}" if self.base_url else path
        headers = {**self.default_headers, **(extra_headers or {})}

        try:
            async with session.post(url, json=data, headers=headers) as resp:
                body = await resp.json()
                if resp.status >= 400:
                    logger.error("POST %s → %s: %s", url, resp.status, body)
                return body
        except Exception as exc:
            logger.error("POST %s failed: %s", url, exc)
            return {}
