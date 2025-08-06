"""
News Aggregator - Fetches news from multiple sources
Supports RSS feeds, News APIs, and web scraping
"""

import asyncio
import aiohttp
import feedparser
import requests
from datetime import datetime, timedelta
import os
from typing import List, Dict, Any
import logging
from urllib.parse import urljoin, urlparse
import hashlib
import re
from bs4 import BeautifulSoup, Tag

logger = logging.getLogger(__name__)

class NewsAggregator:
    """Aggregates news from multiple sources"""
    
    def __init__(self):
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.gnews_api_key = os.getenv('GNEWS_API_KEY')
        
        # RSS Feed Sources
        self.rss_sources = [
            {'name': 'BBC News', 'url': 'http://feeds.bbci.co.uk/news/rss.xml'},
            {'name': 'CNN', 'url': 'http://rss.cnn.com/rss/edition.rss'},
            {'name': 'Reuters', 'url': 'https://feeds.reuters.com/reuters/topNews'},
            {'name': 'TechCrunch', 'url': 'https://feeds.feedburner.com/TechCrunch'},
            {'name': 'The Guardian', 'url': 'https://www.theguardian.com/world/rss'},
            {'name': 'Associated Press', 'url': 'https://feeds.apnews.com/rss/apf-topnews'},
            {'name': 'NPR', 'url': 'https://feeds.npr.org/1001/rss.xml'},
            {'name': 'Ars Technica', 'url': 'http://feeds.arstechnica.com/arstechnica/index'},
            {'name': 'Wired', 'url': 'https://www.wired.com/feed/rss'},
            {'name': 'The Verge', 'url': 'https://www.theverge.com/rss/index.xml'}
        ]
    
    def generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        # Remove special characters and convert to lowercase
        slug = re.sub(r'[^a-zA-Z0-9\s]', '', title.lower())
        # Replace spaces with hyphens
        slug = re.sub(r'\s+', '-', slug.strip())
        # Limit length
        slug = slug[:100]
        # Add hash to ensure uniqueness
        hash_suffix = hashlib.md5(title.encode()).hexdigest()[:8]
        return f"{slug}-{hash_suffix}"
    
    def clean_content(self, content: str) -> str:
        """Clean and format article content"""
        if not content:
            return ""
        
        # Remove HTML tags
        soup = BeautifulSoup(content, 'html.parser')
        text = soup.get_text()
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common unwanted phrases
        unwanted_phrases = [
            'Click here to read more',
            'Continue reading',
            'Read the full article',
            'Subscribe to our newsletter'
        ]
        
        for phrase in unwanted_phrases:
            text = text.replace(phrase, '')
        
        return text.strip()
    
    async def fetch_rss_feeds(self, max_articles_per_source: int = 10) -> List[Dict[str, Any]]:
        """Fetch articles from RSS feeds"""
        articles = []
        
        async with aiohttp.ClientSession() as session:
            for source in self.rss_sources:
                try:
                    logger.info(f"📡 Fetching RSS from {source['name']}")
                    
                    async with session.get(source['url'], timeout=30) as response:
                        if response.status == 200:
                            rss_content = await response.text()
                            feed = feedparser.parse(rss_content)
                            
                            for entry in feed.entries[:max_articles_per_source]:
                                # Extract publication date
                                pub_date = None
                                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                                    pub_date = datetime(*entry.published_parsed[:6])
                                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                                    pub_date = datetime(*entry.updated_parsed[:6])
                                else:
                                    pub_date = datetime.utcnow()
                                
                                # Skip old articles (older than 7 days)
                                if pub_date < datetime.utcnow() - timedelta(days=7):
                                    continue
                                
                                # Extract content
                                content = ""
                                if hasattr(entry, 'content') and entry.content:
                                    content = entry.content[0].value
                                elif hasattr(entry, 'summary'):
                                    content = entry.summary
                                elif hasattr(entry, 'description'):
                                    content = entry.description
                                
                                content = self.clean_content(content)
                                
                                # Skip if content is too short
                                if len(content.split()) < 50:
                                    continue
                                
                                article = {
                                    'title': entry.title,
                                    'slug': self.generate_slug(entry.title),
                                    'content': content,
                                    'excerpt': content[:200] + "..." if len(content) > 200 else content,
                                    'author': getattr(entry, 'author', 'Unknown'),
                                    'source_name': source['name'],
                                    'source_url': entry.link,
                                    'published_at': pub_date,
                                    'image_url': self.extract_image_from_entry(entry),
                                    'images': [],
                                    'meta_data': {
                                        'source_type': 'rss',
                                        'feed_url': source['url']
                                    }
                                }
                                
                                articles.append(article)
                        
                        else:
                            logger.warning(f"⚠️  Failed to fetch RSS from {source['name']}: {response.status}")
                
                except Exception as e:
                    logger.error(f"❌ Error fetching RSS from {source['name']}: {e}")
                    continue
        
        logger.info(f"📰 Fetched {len(articles)} articles from RSS feeds")
        return articles
    
    def extract_image_from_entry(self, entry) -> str:
        """Extract image URL from RSS entry"""
        # Try different fields for images
        if hasattr(entry, 'media_content') and entry.media_content:
            return entry.media_content[0].get('url', '')
        
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url', '')
        
        if hasattr(entry, 'links'):
            for link in entry.links:
                if link.get('type', '').startswith('image/'):
                    return link.get('href', '')
        
        # Look for images in content
        if hasattr(entry, 'content') and entry.content:
            soup = BeautifulSoup(entry.content[0].value, 'html.parser')
            img = soup.find('img')
            if img and isinstance(img, Tag) and img.get('src'):
                return str(img.get('src'))
        
        return ""
    
    async def fetch_newsapi_articles(self, max_articles: int = 20) -> List[Dict[str, Any]]:
        """Fetch articles from NewsAPI"""
        if not self.news_api_key:
            logger.warning("⚠️  NewsAPI key not found, skipping NewsAPI")
            return []
        
        articles = []
        
        try:
            url = "https://newsapi.org/v2/top-headlines"
            params = {
                'apiKey': self.news_api_key,
                'language': 'en',
                'pageSize': max_articles,
                'sortBy': 'publishedAt'
            }
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for article_data in data.get('articles', []):
                    # Skip articles without content
                    if not article_data.get('content') or article_data['content'] == '[Removed]':
                        continue
                    
                    # Parse publication date
                    pub_date = datetime.fromisoformat(
                        article_data['publishedAt'].replace('Z', '+00:00')
                    )
                    
                    # Skip old articles
                    if pub_date < datetime.utcnow() - timedelta(days=7):
                        continue
                    
                    content = self.clean_content(article_data.get('content', ''))
                    
                    # Skip if content is too short
                    if len(content.split()) < 50:
                        continue
                    
                    article = {
                        'title': article_data['title'],
                        'slug': self.generate_slug(article_data['title']),
                        'content': content,
                        'excerpt': article_data.get('description', '')[:200],
                        'author': article_data.get('author', 'Unknown'),
                        'source_name': article_data['source']['name'],
                        'source_url': article_data['url'],
                        'published_at': pub_date.replace(tzinfo=None),
                        'image_url': article_data.get('urlToImage', ''),
                        'images': [],
                        'meta_data': {
                            'source_type': 'newsapi',
                            'api_version': 'v2'
                        }
                    }
                    
                    articles.append(article)
                
                logger.info(f"📰 Fetched {len(articles)} articles from NewsAPI")
                
            else:
                logger.error(f"❌ NewsAPI request failed: {response.status_code}")
        
        except Exception as e:
            logger.error(f"❌ Error fetching from NewsAPI: {e}")
        
        return articles
    
    async def fetch_all_news(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch news from all sources"""
        all_articles = []
        
        # Fetch from RSS feeds
        rss_articles = await self.fetch_rss_feeds(max_articles_per_source=5)
        all_articles.extend(rss_articles)
        
        # Fetch from NewsAPI
        newsapi_articles = await self.fetch_newsapi_articles(max_articles=20)
        all_articles.extend(newsapi_articles)
        
        # Remove duplicates based on title similarity
        unique_articles = self.remove_duplicates(all_articles)
        
        # Sort by publication date (newest first)
        unique_articles.sort(key=lambda x: x['published_at'], reverse=True)
        
        # Limit results
        return unique_articles[:limit]
    
    def remove_duplicates(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate articles based on title similarity"""
        unique_articles = []
        seen_titles = set()
        
        for article in articles:
            title_hash = hashlib.md5(article['title'].lower().encode()).hexdigest()
            
            if title_hash not in seen_titles:
                seen_titles.add(title_hash)
                unique_articles.append(article)
        
        logger.info(f"🔍 Removed {len(articles) - len(unique_articles)} duplicate articles")
        return unique_articles

# Example usage
if __name__ == "__main__":
    async def test_aggregator():
        aggregator = NewsAggregator()
        articles = await aggregator.fetch_all_news(limit=10)
        
        for article in articles:
            print(f"Title: {article['title']}")
            print(f"Source: {article['source_name']}")
            print(f"Published: {article['published_at']}")
            print("-" * 50)
    
    asyncio.run(test_aggregator())
