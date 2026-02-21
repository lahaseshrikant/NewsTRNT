# services/content-engine/utils/text_processing.py
"""Text-processing utilities shared across AI and pipeline modules."""

from __future__ import annotations


def word_count(text: str) -> int:
    """Count words in text."""
    return len(text.split()) if text else 0


def reading_time(text: str, wpm: int = 200) -> int:
    """Estimate reading time in minutes (minimum 1)."""
    return max(1, round(word_count(text) / wpm))


def truncate_words(text: str, limit: int = 80) -> str:
    """Truncate to ``limit`` words, appending '…' if trimmed."""
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit]) + "…"


def truncate_chars(text: str, limit: int = 200) -> str:
    """Truncate to ``limit`` characters with ellipsis."""
    if len(text) <= limit:
        return text
    return text[: limit - 3].rsplit(" ", 1)[0] + "..."
