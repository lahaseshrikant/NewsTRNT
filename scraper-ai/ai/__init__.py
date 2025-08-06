"""
AI Module for NewsNerve Platform
Provides topic classification and SEO optimization capabilities
"""

from .topic_classifier import TopicClassifier, ClassificationResult
from .seo_optimizer import SEOOptimizer, SEOAnalysis

__all__ = [
    'TopicClassifier',
    'ClassificationResult', 
    'SEOOptimizer',
    'SEOAnalysis'
]

__version__ = "1.0.0"
