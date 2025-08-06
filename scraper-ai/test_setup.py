#!/usr/bin/env python3
"""
Test script for NewsNerve Scraper-AI setup
Verifies that all dependencies are properly installed
"""

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def test_import(module_name, description=""):
    """Test importing a module"""
    try:
        __import__(module_name)
        logger.info(f"✅ {description or module_name}")
        return True
    except ImportError as e:
        logger.error(f"❌ {description or module_name}: {e}")
        return False

def test_ai_modules():
    """Test our custom AI modules"""
    try:
        from ai.topic_classifier import TopicClassifier
        from ai.seo_optimizer import SEOOptimizer
        
        # Test topic classifier
        classifier = TopicClassifier()
        result = classifier.classify("AI Technology News", "Artificial intelligence developments...")
        logger.info(f"✅ Topic Classifier: Classified as '{result.category}' with {result.confidence:.2f} confidence")
        
        # Test SEO optimizer
        optimizer = SEOOptimizer()
        analysis = optimizer.optimize("Test Article", "This is test content for SEO analysis.")
        logger.info(f"✅ SEO Optimizer: Generated slug '{analysis.slug}' with score {analysis.score:.1f}")
        
        return True
    except Exception as e:
        logger.error(f"❌ AI Modules: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🧪 Testing NewsNerve Scraper-AI Setup")
    logger.info("=" * 40)
    
    tests_passed = 0
    total_tests = 0
    
    # Core Python modules
    core_modules = [
        ("requests", "HTTP requests"),
        ("bs4", "Beautiful Soup 4"),
        ("feedparser", "Feed parser"),
        ("aiohttp", "Async HTTP"),
        ("pandas", "Data manipulation"),
        ("numpy", "Numerical computing"),
        ("sklearn", "Scikit-learn"),
        ("nltk", "Natural language toolkit"),
        ("textblob", "Text processing"),
        ("openai", "OpenAI API"),
    ]
    
    logger.info("\n📦 Testing core dependencies:")
    for module, description in core_modules:
        total_tests += 1
        if test_import(module, description):
            tests_passed += 1
    
    # Database modules
    logger.info("\n🗄️  Testing database connectivity:")
    db_modules = [
        ("psycopg2", "PostgreSQL adapter"),
        ("sqlite3", "SQLite (built-in)"),
    ]
    
    db_available = False
    for module, description in db_modules:
        total_tests += 1
        if test_import(module, description):
            tests_passed += 1
            db_available = True
            break  # Only need one database adapter
    
    if not db_available:
        logger.warning("⚠️  No database adapters available")
    
    # Optional modules
    logger.info("\n📚 Testing optional dependencies:")
    optional_modules = [
        ("transformers", "Hugging Face Transformers"),
        ("fastapi", "FastAPI framework"),
        ("uvicorn", "ASGI server"),
        ("pydantic", "Data validation"),
    ]
    
    for module, description in optional_modules:
        total_tests += 1
        if test_import(module, description):
            tests_passed += 1
    
    # Test our AI modules
    logger.info("\n🤖 Testing AI modules:")
    total_tests += 1
    if test_ai_modules():
        tests_passed += 1
    
    # Summary
    logger.info("\n" + "=" * 40)
    logger.info(f"📊 Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        logger.info("🎉 All tests passed! Setup is complete.")
        return 0
    elif tests_passed >= total_tests * 0.8:  # 80% pass rate
        logger.info("✅ Setup is mostly complete. Some optional features may not work.")
        return 0
    else:
        logger.error("❌ Setup incomplete. Please install missing dependencies.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
