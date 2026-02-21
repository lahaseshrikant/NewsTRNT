# services/content-engine/api/ai_processing.py
"""AI processing API routes — summarise, classify, analyse sentiment, SEO."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from ai.classifier import TopicClassifier
from ai.seo_optimizer import SEOOptimizer
from ai.sentiment import SentimentAnalyzer
from ai.summarizer import Summarizer
from ai.provider import get_ai_provider
from middleware.auth import verify_api_key
from models.article import (
    ClassifyRequest,
    FullProcessRequest,
    SEORequest,
    SentimentRequest,
    SummarizeRequest,
)
from models.responses import AIStatusResponse, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status", response_model=AIStatusResponse)
async def ai_status():
    """Current AI provider status."""
    provider = get_ai_provider()
    info = provider.status_dict()
    return AIStatusResponse(
        provider=info["provider"],
        model=info["model"],
        available=info["available"],
    )


@router.post("/summarize", dependencies=[Depends(verify_api_key)])
async def summarize(req: SummarizeRequest):
    """Generate a summary of the provided content."""
    summarizer = Summarizer()
    if req.style == "short":
        result = await summarizer.short_summary(req.content)
    else:
        result = await summarizer.summarize(req.content, max_length=req.max_length)

    return APIResponse(
        data={"summary": result, "word_count": len(result.split())},
        message="Summary generated",
    )


@router.post("/classify", dependencies=[Depends(verify_api_key)])
async def classify(req: ClassifyRequest):
    """Classify text into a news category."""
    classifier = TopicClassifier()
    result = classifier.classify(req.title, req.content, req.summary)
    return APIResponse(
        data={
            "category": result.category,
            "confidence": result.confidence,
            "keywords": result.keywords,
            "all_categories": classifier.all_categories(),
        },
        message=f"Classified as {result.category} ({result.confidence:.0%})",
    )


@router.post("/sentiment", dependencies=[Depends(verify_api_key)])
async def sentiment(req: SentimentRequest):
    """Analyse sentiment of text."""
    analyzer = SentimentAnalyzer()
    result = await analyzer.analyze(req.text)
    return APIResponse(
        data={
            "score": result.score,
            "label": result.label,
            "confidence": result.confidence,
            "highlights": result.highlights,
        },
        message=f"Sentiment: {result.label} ({result.score:+.2f})",
    )


@router.post("/seo-optimize", dependencies=[Depends(verify_api_key)])
async def seo_optimize(req: SEORequest):
    """Run SEO analysis on title + content."""
    optimizer = SEOOptimizer()
    analysis = optimizer.optimize(req.title, req.content, req.summary)
    return APIResponse(
        data={
            "score": analysis.score,
            "title_score": analysis.title_score,
            "content_score": analysis.content_score,
            "readability_score": analysis.readability_score,
            "optimized_title": analysis.optimized_title,
            "meta_description": analysis.optimized_meta_description,
            "slug": analysis.slug,
            "keywords": analysis.keywords,
            "suggestions": analysis.suggestions,
        },
        message=f"SEO score: {analysis.score:.0f}/100",
    )


@router.post("/process", dependencies=[Depends(verify_api_key)])
async def full_process(req: FullProcessRequest):
    """Run the full AI pipeline on a single article."""
    result = {}

    if "summarize" in req.operations:
        summarizer = Summarizer()
        result["summary"] = await summarizer.summarize(req.content)
        result["short_summary"] = await summarizer.short_summary(req.content)
        result["alt_headlines"] = await summarizer.headline_alternatives(req.title, req.content)
        result["social_posts"] = await summarizer.social_posts(req.title, result["summary"])
        result["key_quotes"] = await summarizer.extract_key_quotes(req.content)

    if "classify" in req.operations:
        classifier = TopicClassifier()
        cls = classifier.classify(req.title, req.content, result.get("summary", ""))
        result["category"] = cls.category
        result["category_confidence"] = cls.confidence
        result["category_keywords"] = cls.keywords

    if "seo" in req.operations:
        optimizer = SEOOptimizer()
        seo = optimizer.optimize(req.title, req.content, result.get("summary", ""))
        result["seo_score"] = seo.score
        result["seo_slug"] = seo.slug
        result["seo_title"] = seo.optimized_title
        result["meta_description"] = seo.optimized_meta_description
        result["seo_keywords"] = seo.keywords
        result["suggestions"] = seo.suggestions

    if "sentiment" in req.operations:
        analyzer = SentimentAnalyzer()
        sent = await analyzer.analyze(req.content)
        result["sentiment_score"] = sent.score
        result["sentiment_label"] = sent.label

    return APIResponse(data=result, message="Full AI processing complete")
