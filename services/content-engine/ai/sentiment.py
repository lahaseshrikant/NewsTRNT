# services/content-engine/ai/sentiment.py
"""Sentiment analysis for articles.

Uses OpenAI for accurate sentiment when available; falls back to a simple
keyword-based heuristic otherwise.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import List

from .provider import AIProvider, get_ai_provider

logger = logging.getLogger(__name__)

# ── Keyword lexicons for fallback ────────────────────────────────────

POSITIVE_WORDS = frozenset({
    "good", "great", "excellent", "amazing", "wonderful", "positive",
    "growth", "gain", "profit", "success", "improve", "benefit",
    "optimistic", "breakthrough", "achievement", "progress",
    "innovation", "hope", "support", "win", "strong", "boost",
})

NEGATIVE_WORDS = frozenset({
    "bad", "terrible", "awful", "negative", "loss", "crisis", "fail",
    "decline", "drop", "crash", "threat", "risk", "damage", "destroy",
    "conflict", "war", "death", "recession", "collapse", "scandal",
    "fraud", "corruption", "disaster", "attack", "violence",
})


@dataclass
class SentimentResult:
    score: float  # -1.0 … +1.0
    label: str  # positive | negative | neutral | mixed
    confidence: float = 0.0
    highlights: List[str] = field(default_factory=list)


class SentimentAnalyzer:
    """Analyse sentiment of text using AI or keyword heuristics."""

    def __init__(self, provider: AIProvider | None = None) -> None:
        self.provider = provider or get_ai_provider()

    async def analyze(self, text: str) -> SentimentResult:
        """Return sentiment for the given text."""
        if not text or len(text.strip()) < 10:
            return SentimentResult(score=0.0, label="neutral")

        # Try AI-powered analysis first
        if self.provider.available:
            return await self._ai_analyze(text)

        return self._keyword_analyze(text)

    async def _ai_analyze(self, text: str) -> SentimentResult:
        data = await self.provider.chat_json(
            system=(
                "You analyse sentiment of news text. "
                "Return JSON: {\"score\": float(-1..1), \"label\": \"positive|negative|neutral|mixed\", "
                "\"confidence\": float(0..1), \"highlights\": [\"key phrase 1\", ...]}"
            ),
            user=f"Analyse the sentiment of this text:\n\n{text[:3000]}",
            max_tokens=250,
            temperature=0.1,
        )
        if data and "score" in data:
            return SentimentResult(
                score=float(data["score"]),
                label=str(data.get("label", "neutral")),
                confidence=float(data.get("confidence", 0.8)),
                highlights=data.get("highlights", []),
            )
        # fallback
        return self._keyword_analyze(text)

    # ── Fallback keyword analyser ────────────────────────────────────

    @staticmethod
    def _keyword_analyze(text: str) -> SentimentResult:
        words = set(text.lower().split())
        pos_count = len(words & POSITIVE_WORDS)
        neg_count = len(words & NEGATIVE_WORDS)
        total = pos_count + neg_count

        if total == 0:
            return SentimentResult(score=0.0, label="neutral", confidence=0.3)

        score = (pos_count - neg_count) / total
        if score > 0.2:
            label = "positive"
        elif score < -0.2:
            label = "negative"
        elif pos_count > 0 and neg_count > 0:
            label = "mixed"
        else:
            label = "neutral"

        return SentimentResult(
            score=round(score, 3),
            label=label,
            confidence=round(min(total / 10, 0.7), 2),
        )
