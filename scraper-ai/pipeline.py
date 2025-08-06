"""
NewsNerve AI-Powered News Scraper
Main pipeline for fetching, processing, and storing news articles
"""

import os
import sys
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraping.fetch_news import NewsAggregator
from ai.summarizer import NewsSummarizer
from ai.topic_classifier import TopicClassifier
from ai.seo_optimizer import SEOOptimizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('newsnerve.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class NewsNervePipeline:
    """Main pipeline for processing news articles"""
    
    def __init__(self):
        self.db_connection = None
        self.news_aggregator = NewsAggregator()
        self.summarizer = NewsSummarizer()
        self.topic_classifier = TopicClassifier()
        self.seo_optimizer = SEOOptimizer()
        
    def connect_database(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'newsnerve'),
                user=os.getenv('DB_USER', 'admin'),
                password=os.getenv('DB_PASSWORD', 'password123'),
                port=os.getenv('DB_PORT', '5432')
            )
            logger.info("✅ Connected to database successfully")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def close_database(self):
        """Close database connection"""
        if self.db_connection:
            self.db_connection.close()
            logger.info("🔒 Database connection closed")
    
    async def process_article(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single article through the AI pipeline"""
        try:
            # Generate summary
            summary = await self.summarizer.generate_summary(article_data['content'])
            
            # Generate short content (60-100 words)
            short_content = await self.summarizer.generate_short_summary(article_data['content'])
            
            # Classify topic and determine category
            category = self.topic_classifier.classify_article(article_data['content'])
            
            # Generate SEO metadata
            seo_data = self.seo_optimizer.optimize_article(
                title=article_data['title'],
                content=article_data['content'],
                summary=summary
            )
            
            # Calculate reading time (average 200 words per minute)
            word_count = len(article_data['content'].split())
            reading_time = max(1, round(word_count / 200))
            
            # Create processed article data
            processed_article = {
                **article_data,
                'summary': summary,
                'short_content': short_content,
                'category_slug': category,
                'reading_time': reading_time,
                'seo_title': seo_data['title'],
                'seo_description': seo_data['description'],
                'seo_keywords': seo_data['keywords'],
                'ai_generated': False,
                'ai_summary': True,
                'ai_metadata': {
                    'confidence_score': seo_data.get('confidence', 0.8),
                    'processing_timestamp': datetime.utcnow().isoformat(),
                    'model_version': '1.0'
                }
            }
            
            return processed_article
            
        except Exception as e:
            logger.error(f"❌ Error processing article: {e}")
            return article_data
    
    def get_category_id(self, category_slug: str) -> Optional[str]:
        """Get category ID from slug"""
        if not self.db_connection:
            logger.error("No database connection available")
            return None
            
        try:
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT id FROM categories WHERE slug = %s AND is_active = true",
                (category_slug,)
            )
            result = cursor.fetchone()
            cursor.close()
            
            if result:
                return str(result['id'])
            else:
                # Return technology category as default
                cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
                cursor.execute(
                    "SELECT id FROM categories WHERE slug = 'technology' AND is_active = true"
                )
                result = cursor.fetchone()
                cursor.close()
                return str(result['id']) if result else None
                
        except Exception as e:
            logger.error(f"❌ Error getting category ID: {e}")
            return None
    
    def save_article_to_database(self, article: Dict[str, Any]) -> bool:
        """Save processed article to database"""
        if not self.db_connection:
            logger.error("No database connection available")
            return False
            
        try:
            cursor = self.db_connection.cursor()
            
            # Check if article already exists
            cursor.execute(
                "SELECT id FROM articles WHERE source_url = %s OR slug = %s",
                (article.get('source_url'), article.get('slug'))
            )
            
            if cursor.fetchone():
                logger.info(f"📄 Article already exists: {article.get('title', 'Unknown')}")
                cursor.close()
                return False
            
            # Get category ID
            category_id = self.get_category_id(article.get('category_slug', 'technology'))
            
            # Insert article
            insert_query = """
                INSERT INTO articles (
                    title, slug, summary, content, short_content, excerpt,
                    author, source_name, source_url, image_url, images,
                    category_id, published_at, is_published, is_featured,
                    reading_time, seo_title, seo_description, seo_keywords,
                    ai_generated, ai_summary, ai_metadata, meta_data
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING id
            """
            
            cursor.execute(insert_query, (
                article.get('title'),
                article.get('slug'),
                article.get('summary'),
                article.get('content'),
                article.get('short_content'),
                article.get('excerpt'),
                article.get('author'),
                article.get('source_name'),
                article.get('source_url'),
                article.get('image_url'),
                json.dumps(article.get('images', [])),
                category_id,
                article.get('published_at'),
                True,  # is_published
                False,  # is_featured
                article.get('reading_time'),
                article.get('seo_title'),
                article.get('seo_description'),
                article.get('seo_keywords', []),
                article.get('ai_generated', False),
                article.get('ai_summary', True),
                json.dumps(article.get('ai_metadata', {})),
                json.dumps(article.get('meta_data', {}))
            ))
            
            result = cursor.fetchone()
            if result:
                article_id = result[0]
                self.db_connection.commit()
                cursor.close()
                
                logger.info(f"✅ Article saved: {article.get('title', 'Unknown')} (ID: {article_id})")
                return True
            else:
                logger.error("Failed to get article ID after insert")
                cursor.close()
                return False
            
        except Exception as e:
            logger.error(f"❌ Error saving article: {e}")
            if self.db_connection:
                self.db_connection.rollback()
            return False
    
    async def run_pipeline(self, max_articles: int = 50):
        """Run the complete news processing pipeline"""
        logger.info("🚀 Starting NewsNerve AI Pipeline")
        
        try:
            # Connect to database
            self.connect_database()
            
            # Fetch news articles
            logger.info("📰 Fetching news articles...")
            raw_articles = await self.news_aggregator.fetch_all_news(limit=max_articles)
            logger.info(f"📊 Fetched {len(raw_articles)} articles")
            
            # Process articles
            processed_count = 0
            saved_count = 0
            
            for i, article in enumerate(raw_articles, 1):
                logger.info(f"🔄 Processing article {i}/{len(raw_articles)}: {article.get('title', 'Unknown')}")
                
                # Process through AI pipeline
                processed_article = await self.process_article(article)
                processed_count += 1
                
                # Save to database
                if self.save_article_to_database(processed_article):
                    saved_count += 1
                
                # Add small delay to avoid overwhelming APIs
                await asyncio.sleep(1)
            
            logger.info(f"✅ Pipeline completed: {processed_count} processed, {saved_count} saved")
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed: {e}")
            raise
        finally:
            self.close_database()

async def main():
    """Main entry point"""
    pipeline = NewsNervePipeline()
    await pipeline.run_pipeline(max_articles=20)

if __name__ == "__main__":
    asyncio.run(main())
