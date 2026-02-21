# services/content-engine/ai/classifier.py
"""Topic classification using keyword rules (+ optional ML).

Ported from ``scraper-ai/ai/topic_classifier.py`` with:
  - cleaner API (returns dataclass)
  - 12 categories (added lifestyle & automotive)
  - confidence normalisation
  - optional sklearn ML upgrade path preserved
"""

from __future__ import annotations

import logging
import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Optional ML imports
try:
    from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
    from sklearn.naive_bayes import MultinomialNB  # type: ignore
    from sklearn.pipeline import Pipeline as SkPipeline  # type: ignore
    import pickle

    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


@dataclass
class ClassificationResult:
    category: str
    confidence: float
    keywords: List[str] = field(default_factory=list)


# ── Category keyword map ─────────────────────────────────────────────

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "technology": [
        "tech", "ai", "artificial intelligence", "software", "hardware",
        "computer", "digital", "internet", "cyber", "startup", "innovation",
        "machine learning", "blockchain", "cloud", "saas", "app",
    ],
    "politics": [
        "government", "election", "vote", "president", "congress", "senate",
        "policy", "law", "politics", "political", "democrat", "republican",
        "legislation", "parliament", "supreme court",
    ],
    "business": [
        "business", "economy", "financial", "market", "stock", "investment",
        "company", "corporate", "profit", "revenue", "economic", "gdp",
        "trade", "merger", "acquisition", "ipo",
    ],
    "sports": [
        "sport", "game", "team", "player", "match", "tournament",
        "championship", "football", "basketball", "baseball", "soccer",
        "cricket", "tennis", "olympic", "nfl", "nba",
    ],
    "health": [
        "health", "medical", "doctor", "hospital", "medicine", "disease",
        "treatment", "healthcare", "patient", "virus", "vaccine", "mental health",
        "fitness", "nutrition", "wellness",
    ],
    "science": [
        "science", "research", "study", "discovery", "scientist",
        "experiment", "scientific", "laboratory", "analysis", "data",
        "physics", "biology", "chemistry", "space", "nasa",
    ],
    "entertainment": [
        "movie", "film", "music", "celebrity", "entertainment", "actor",
        "actress", "show", "concert", "album", "award", "streaming",
        "netflix", "disney", "hollywood", "tv series",
    ],
    "world": [
        "international", "global", "world", "country", "nation", "foreign",
        "embassy", "diplomatic", "war", "conflict", "united nations",
        "refugee", "humanitarian",
    ],
    "environment": [
        "climate", "environment", "green", "renewable", "pollution",
        "carbon", "emissions", "sustainability", "nature", "conservation",
        "solar", "wind energy", "deforestation", "ocean",
    ],
    "education": [
        "education", "school", "university", "student", "teacher",
        "learning", "academic", "college", "curriculum", "degree",
        "scholarship", "campus",
    ],
    "lifestyle": [
        "lifestyle", "travel", "food", "fashion", "beauty", "home",
        "design", "recipe", "cooking", "vacation", "wellness", "culture",
    ],
    "automotive": [
        "car", "vehicle", "electric vehicle", "ev", "tesla", "automotive",
        "driving", "motor", "suv", "truck", "hybrid", "self-driving",
    ],
}


class TopicClassifier:
    """Classify articles into categories using rules or ML."""

    def __init__(self) -> None:
        self.categories = CATEGORY_KEYWORDS
        self._ml_model = None
        self._load_ml_model()

    # ── ML model (optional) ──────────────────────────────────────────

    def _load_ml_model(self) -> None:
        model_path = os.path.join(os.path.dirname(__file__), "models", "topic_classifier.pkl")
        if SKLEARN_AVAILABLE and os.path.exists(model_path):
            try:
                with open(model_path, "rb") as fh:
                    self._ml_model = pickle.load(fh)  # noqa: S301
                logger.info("Loaded ML topic model from %s", model_path)
            except Exception as exc:
                logger.warning("Could not load ML model: %s", exc)

    def train(self, data: List[Tuple[str, str]]) -> bool:
        """Train/retrain the ML classifier with ``(text, category)`` pairs."""
        if not SKLEARN_AVAILABLE:
            logger.warning("scikit-learn not installed — cannot train")
            return False
        try:
            texts, labels = zip(*data)
            pipe = SkPipeline([
                ("tfidf", TfidfVectorizer(max_features=5000, stop_words="english")),
                ("clf", MultinomialNB()),
            ])
            pipe.fit(texts, labels)
            self._ml_model = pipe

            model_dir = os.path.join(os.path.dirname(__file__), "models")
            os.makedirs(model_dir, exist_ok=True)
            with open(os.path.join(model_dir, "topic_classifier.pkl"), "wb") as fh:
                pickle.dump(pipe, fh)
            logger.info("ML model trained & saved")
            return True
        except Exception as exc:
            logger.error("Training failed: %s", exc)
            return False

    # ── Classification ───────────────────────────────────────────────

    def classify(self, title: str, content: str = "", summary: str = "") -> ClassificationResult:
        """Return the best-matching category for the article."""
        combined = f"{title} {title} {summary} {content}"

        if self._ml_model and SKLEARN_AVAILABLE:
            try:
                pred = self._ml_model.predict([combined])[0]
                proba = max(self._ml_model.predict_proba([combined])[0])
                return ClassificationResult(category=pred, confidence=round(proba, 3))
            except Exception:
                pass  # fall through to rules

        return self._rule_based(combined)

    def _rule_based(self, text: str) -> ClassificationResult:
        text_lower = text.lower()
        text_clean = re.sub(r"[^\w\s]", " ", text_lower)

        scores: Dict[str, int] = {}
        matched: Dict[str, List[str]] = {}

        for cat, kws in self.categories.items():
            score = 0
            cat_kws: List[str] = []
            for kw in kws:
                count = text_lower.count(kw)
                if count > 0:
                    score += count * len(kw.split())
                    cat_kws.extend([kw] * count)
            if score:
                scores[cat] = score
                matched[cat] = cat_kws

        if not scores:
            return ClassificationResult(category="general", confidence=0.1)

        best = max(scores, key=scores.get)  # type: ignore[arg-type]
        total = sum(scores.values())
        conf = min(scores[best] / total, 0.95) if total else 0.1

        return ClassificationResult(
            category=best,
            confidence=round(conf, 3),
            keywords=list(dict.fromkeys(matched.get(best, [])))[:5],
        )

    # ── Helpers ──────────────────────────────────────────────────────

    def all_categories(self) -> List[str]:
        return list(self.categories.keys())

    def keywords_for(self, category: str) -> List[str]:
        return self.categories.get(category, [])
