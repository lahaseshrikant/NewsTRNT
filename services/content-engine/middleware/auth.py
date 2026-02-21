# services/content-engine/middleware/auth.py
"""API-key authentication for incoming requests from admin-backend."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from config import get_settings

logger = logging.getLogger(__name__)

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: Optional[str] = Security(_api_key_header),
) -> str:
    """FastAPI dependency that validates the X-API-Key header.

    Returns the validated key on success; raises 401/403 otherwise.

    Usage
    -----
    ```python
    @router.post("/ingest", dependencies=[Depends(verify_api_key)])
    async def ingest(): ...
    ```
    """
    settings = get_settings()

    # In development mode with no key configured, allow all requests
    if settings.environment == "development" and not settings.engine_api_key:
        return "dev-bypass"

    if not api_key:
        logger.warning("Request missing X-API-Key header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Provide X-API-Key header.",
        )

    if api_key != settings.engine_api_key:
        logger.warning("Invalid API key attempt")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )

    return api_key


class OptionalAPIKey:
    """Allow endpoints that work both authenticated and unauthenticated.

    Authenticated callers get richer responses (e.g. internal metrics).
    """

    def __init__(self, api_key: Optional[str] = Security(_api_key_header)):
        self.authenticated = False
        settings = get_settings()

        if api_key and api_key == settings.engine_api_key:
            self.authenticated = True
        elif settings.environment == "development" and not settings.engine_api_key:
            self.authenticated = True
