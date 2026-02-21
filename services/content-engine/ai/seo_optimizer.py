# services/content-engine/ai/seo_optimizer.py
"""SEO optimiser — slugs, keywords, meta descriptions, readability, schema markup.

Ported from ``scraper-ai/ai/seo_optimizer.py`` (fully rule-based, zero API cost).
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Tuple
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

STOP_WORDS = frozenset({
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was",
    "will", "with", "but", "or", "not", "this", "they", "have", "had",
    "what", "said", "each", "which", "their", "time", "into", "only", "so",
    "his", "her", "like", "can", "could", "would", "she", "about", "over",
})


@dataclass
class SEOAnalysis:
    score: float  # 0-100
    title_score: float
    meta_description_score: float
    content_score: float
    readability_score: float
    suggestions: List[str]
    optimized_title: str
    optimized_meta_description: str
    keywords: List[str]
    slug: str


class SEOOptimizer:
    """Fully rule-based SEO analyser that works without any API keys."""

    IDEAL_TITLE = (50, 60)
    IDEAL_META = (150, 160)
    IDEAL_PARA = (150, 300)
    MAX_SENTENCE_WORDS = 25

    # ── Slug ─────────────────────────────────────────────────────────

    def generate_slug(self, title: str) -> str:
        slug = re.sub(r"[^\w\s-]", "", title.lower())
        slug = re.sub(r"[-\s]+", "-", slug).strip("-")
        words = slug.split("-")
        meaningful = [w for w in words if w not in STOP_WORDS]
        if len(meaningful) < 3:
            meaningful = words[:5]
        return "-".join(meaningful[:8])

    # ── Keywords ─────────────────────────────────────────────────────

    def extract_keywords(self, title: str, content: str, limit: int = 10) -> List[str]:
        combined = f"{title} {title} {content}"
        text = re.sub(r"[^\w\s]", " ", combined.lower())
        words = text.split()
        filtered = [w for w in words if len(w) > 3 and w not in STOP_WORDS]

        freq: Dict[str, int] = {}
        for w in filtered:
            freq[w] = freq.get(w, 0) + 1
        ranked = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w for w, c in ranked[:limit] if c > 1]

    # ── Title ────────────────────────────────────────────────────────

    def optimize_title(self, title: str, keywords: List[str]) -> str:
        opt = title.strip()
        if keywords and keywords[0].lower() not in opt.lower()[:30]:
            opt = f"{keywords[0].title()} in {opt}"

        if len(opt) > self.IDEAL_TITLE[1]:
            w = opt.split()
            while len(" ".join(w)) > self.IDEAL_TITLE[1] and len(w) > 3:
                w.pop()
            opt = " ".join(w)

        return opt

    # ── Meta description ─────────────────────────────────────────────

    def generate_meta_description(self, title: str, content: str, keywords: List[str]) -> str:
        sentences = content.split(".")
        parts, length = [], 0
        for s in sentences:
            s = s.strip()
            if s and length + len(s) < 140:
                parts.append(s)
                length += len(s) + 1
            else:
                break
        desc = ". ".join(parts)
        if keywords and keywords[0].lower() not in desc.lower():
            desc = f"Learn about {keywords[0]}. {desc}"
        if len(desc) > self.IDEAL_META[1]:
            desc = desc[: self.IDEAL_META[1] - 3] + "..."
        if len(desc) < self.IDEAL_META[0]:
            for cta in [" Read more.", " Get the latest updates.", " Stay informed."]:
                if len(desc + cta) <= self.IDEAL_META[1]:
                    desc += cta
                    break
        return desc

    # ── Readability ──────────────────────────────────────────────────

    def analyze_readability(self, content: str) -> Tuple[float, List[str]]:
        suggestions: List[str] = []
        score = 100.0

        sents = [s.strip() for s in content.split(".") if s.strip()]
        if sents:
            avg_len = sum(len(s.split()) for s in sents) / len(sents)
            if avg_len > self.MAX_SENTENCE_WORDS:
                score -= 20
                suggestions.append(
                    f"Avg sentence length ({avg_len:.0f} words) is long. Aim for <{self.MAX_SENTENCE_WORDS}."
                )

        paras = [p.strip() for p in content.split("\n\n") if p.strip()]
        long_p = [p for p in paras if len(p) > self.IDEAL_PARA[1]]
        if long_p:
            score -= len(long_p) * 10
            suggestions.append(f"{len(long_p)} paragraph(s) too long — break them up.")

        passive = ["was", "were", "been", "being"]
        total_words = len(content.split())
        if total_words:
            ratio = sum(content.lower().count(w) for w in passive) / total_words
            if ratio > 0.1:
                score -= 15
                suggestions.append("Consider using more active voice.")

        return max(score, 0), suggestions

    # ── Content SEO ──────────────────────────────────────────────────

    def analyze_content_seo(self, title: str, content: str, keywords: List[str]) -> Tuple[float, List[str]]:
        suggestions: List[str] = []
        score = 100.0
        if not keywords:
            return 70, ["No keywords found."]

        pk = keywords[0].lower()
        cl = content.lower()
        wc = len(content.split())
        density = (cl.count(pk) / wc) * 100 if wc else 0

        if density < 0.5:
            score -= 20
            suggestions.append(f"Keyword density ({density:.1f}%) too low — aim for 0.5-2%.")
        elif density > 3:
            score -= 15
            suggestions.append(f"Keyword density ({density:.1f}%) too high — avoid stuffing.")

        first_para = content.split("\n")[0] if content else ""
        if pk not in first_para.lower():
            score -= 15
            suggestions.append("Include primary keyword in the first paragraph.")

        if wc < 300:
            score -= 25
            suggestions.append(f"Content too short ({wc} words). Aim for 300+.")

        return max(score, 0), suggestions

    # ── Full optimisation ────────────────────────────────────────────

    def optimize(self, title: str, content: str, summary: str = "") -> SEOAnalysis:
        keywords = self.extract_keywords(title, content + " " + summary)
        opt_title = self.optimize_title(title, keywords)
        meta = self.generate_meta_description(title, content, keywords)
        slug = self.generate_slug(title)

        t_score = 100.0 if self.IDEAL_TITLE[0] <= len(title) <= self.IDEAL_TITLE[1] else 70.0
        m_score = 100.0 if len(meta) >= self.IDEAL_META[0] else 80.0
        c_score, c_sug = self.analyze_content_seo(title, content, keywords)
        r_score, r_sug = self.analyze_readability(content)

        overall = (t_score + m_score + c_score + r_score) / 4

        return SEOAnalysis(
            score=overall,
            title_score=t_score,
            meta_description_score=m_score,
            content_score=c_score,
            readability_score=r_score,
            suggestions=c_sug + r_sug,
            optimized_title=opt_title,
            optimized_meta_description=meta,
            keywords=keywords,
            slug=slug,
        )

    # ── Schema markup ────────────────────────────────────────────────

    def generate_schema_markup(
        self,
        title: str,
        content: str,
        author: str,
        published_date: str,
        category: str,
        image_url: str = "",
    ) -> Dict:
        schema: Dict = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "articleBody": (content[:500] + "...") if len(content) > 500 else content,
            "author": {"@type": "Person", "name": author},
            "publisher": {
                "@type": "Organization",
                "name": "NewsTRNT",
                "logo": {"@type": "ImageObject", "url": "https://newstrnt.com/logo.png"},
            },
            "datePublished": published_date,
            "dateModified": published_date,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"https://newstrnt.com/article/{self.generate_slug(title)}",
            },
            "articleSection": category.title(),
        }
        if image_url:
            schema["image"] = {"@type": "ImageObject", "url": image_url}
        return schema
