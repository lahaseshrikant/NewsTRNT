# services/content-engine/ai/provider.py
"""Unified AI provider abstraction.

Supports OpenAI (default) and can be extended for Anthropic, local models, etc.
Every AI module goes through this provider so we swap models in one place.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Optional

import openai

from config import get_settings

logger = logging.getLogger(__name__)


class AIProvider:
    """Thin wrapper around the OpenAI client.

    Centralises model selection, temperature defaults, and error handling.
    Other AI modules (summarizer, classifier …) call ``provider.chat(…)``
    instead of invoking ``openai`` directly.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._client: Optional[openai.OpenAI] = None
        self.model = settings.ai_model
        self.available = False

        if settings.openai_api_key:
            try:
                self._client = openai.OpenAI(api_key=settings.openai_api_key)
                self.available = True
                logger.info("AI provider initialised (model=%s)", self.model)
            except Exception as exc:
                logger.error("Failed to initialise OpenAI client: %s", exc)
        else:
            logger.warning("OPENAI_API_KEY not set — AI features disabled")

    # ── public helpers ───────────────────────────────────────────────

    async def chat(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 500,
        temperature: float = 0.3,
    ) -> str:
        """Send a chat-completion request and return the assistant text.

        Falls back to an empty string on error so callers always get ``str``.
        """
        if not self._client:
            logger.warning("AI provider unavailable — returning empty response")
            return ""

        try:
            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return response.choices[0].message.content.strip()

        except openai.RateLimitError:
            logger.warning("OpenAI rate limit hit")
            return ""
        except openai.APIConnectionError:
            logger.error("OpenAI connection error")
            return ""
        except Exception as exc:
            logger.error("AI chat error: %s", exc)
            return ""

    async def chat_json(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 600,
        temperature: float = 0.2,
    ) -> dict:
        """Like ``chat()`` but parses the response as JSON.

        Returns ``{}`` on parse failure.
        """
        import json

        raw = await self.chat(
            system=system + "\nRespond ONLY with valid JSON, no markdown.",
            user=user,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        if not raw:
            return {}

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("AI response was not valid JSON: %s…", raw[:120])
            return {}

    # ── stats ────────────────────────────────────────────────────────

    def status_dict(self) -> dict:
        return {
            "provider": "openai",
            "model": self.model,
            "available": self.available,
        }


@lru_cache()
def get_ai_provider() -> AIProvider:
    """Singleton accessor—keeps one client across the app lifetime."""
    return AIProvider()
