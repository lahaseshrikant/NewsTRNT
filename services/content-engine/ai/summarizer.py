# services/content-engine/ai/summarizer.py
"""AI-powered article summariser.

Ported from ``scraper-ai/ai/summarizer.py`` with:
  - configurable model via AIProvider
  - fallback truncation when API is unavailable
  - headline alternatives & key-quote extraction
  - social-media post generation
"""

from __future__ import annotations

import logging
from typing import Dict, List

from .provider import AIProvider, get_ai_provider

logger = logging.getLogger(__name__)


class Summarizer:
    """Generate article summaries, short reads, headlines, quotes, and social posts."""

    def __init__(self, provider: AIProvider | None = None) -> None:
        self.provider = provider or get_ai_provider()

    # ── summaries ────────────────────────────────────────────────────

    async def summarize(self, content: str, max_length: int = 200) -> str:
        """Comprehensive summary (~`max_length` words)."""
        if not content or len(content.strip()) < 20:
            return ""

        result = await self.provider.chat(
            system=(
                "You are a professional news editor. Create clear, accurate, "
                "and engaging summaries. Do NOT invent facts."
            ),
            user=(
                f"Summarize the following article in approximately {max_length} words.\n\n"
                f"Article:\n{content[:4000]}\n\nSummary:"
            ),
            max_tokens=400,
            temperature=0.3,
        )
        if result:
            logger.info("Generated summary (%d chars)", len(result))
            return result

        # fallback
        sentences = content.split(". ")
        return ". ".join(sentences[:3]) + ("." if len(sentences) > 3 else "")

    async def short_summary(self, content: str) -> str:
        """60-100 word quick-read summary."""
        if not content or len(content.strip()) < 20:
            return ""

        result = await self.provider.chat(
            system=(
                "You are a news editor specialising in brief, impactful summaries "
                "for busy readers."
            ),
            user=(
                "Create a concise summary of this article in exactly 60-100 words.\n\n"
                f"Article:\n{content[:3000]}\n\nShort Summary (60-100 words):"
            ),
            max_tokens=150,
            temperature=0.2,
        )
        if result:
            logger.info("Generated short summary (%d words)", len(result.split()))
            return result

        words = content.split()[:80]
        return " ".join(words) + ("..." if len(words) == 80 else "")

    # ── headlines ────────────────────────────────────────────────────

    async def headline_alternatives(self, title: str, content: str) -> List[str]:
        """Generate 3 alternative headlines for A/B testing."""
        result = await self.provider.chat(
            system="You are a digital marketing expert who creates compelling, SEO-friendly headlines.",
            user=(
                "Given this article title and content, create 3 alternative headlines.\n"
                "Each should be engaging, accurate, and SEO-optimised.\n\n"
                f"Original Title: {title}\n"
                f"Content snippet: {content[:1000]}\n\n"
                "Provide exactly 3 headlines, one per line:"
            ),
            max_tokens=200,
            temperature=0.4,
        )
        if not result:
            return []
        return [line.strip().lstrip("0123456789.-) ") for line in result.split("\n") if line.strip()]

    # ── key quotes ───────────────────────────────────────────────────

    async def extract_key_quotes(self, content: str) -> List[str]:
        """Extract top 3 impactful quotes from the article."""
        result = await self.provider.chat(
            system="You are a journalist who identifies the most newsworthy quotes.",
            user=(
                "Extract the 3 most important direct quotes from this article.\n"
                "Format: \"Quote\" - Speaker Name, Title/Org\n\n"
                f"Article:\n{content[:4000]}\n\nKey Quotes:"
            ),
            max_tokens=300,
            temperature=0.1,
        )
        if not result:
            return []
        return [q.strip() for q in result.split("\n") if q.strip()]

    # ── social media ─────────────────────────────────────────────────

    async def social_posts(self, title: str, summary: str) -> Dict[str, str]:
        """Generate platform-specific social media posts."""
        result = await self.provider.chat(
            system="You are a social media manager for a news platform.",
            user=(
                f"Create social posts for this article:\n"
                f"Title: {title}\nSummary: {summary}\n\n"
                "Format:\nTwitter: [tweet under 280 chars with hashtags]\n"
                "Facebook: [1-2 engaging sentences]\n"
                "LinkedIn: [professional, 2-3 sentences]"
            ),
            max_tokens=400,
            temperature=0.4,
        )
        if not result:
            return {}

        posts: Dict[str, str] = {}
        current_platform = None
        for line in result.split("\n"):
            line = line.strip()
            for platform in ("Twitter", "Facebook", "LinkedIn"):
                if line.lower().startswith(platform.lower() + ":"):
                    current_platform = platform.lower()
                    posts[current_platform] = line.split(":", 1)[1].strip()
                    break
            else:
                if current_platform and line:
                    posts[current_platform] += " " + line

        return posts
