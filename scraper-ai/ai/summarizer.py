"""
AI News Summarizer using OpenAI GPT
Generates summaries and short content for news articles
"""

import os
import openai
from typing import Optional
import logging
import asyncio

logger = logging.getLogger(__name__)

class NewsSummarizer:
    """AI-powered news summarizer"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
    async def generate_summary(self, content: str, max_length: int = 200) -> str:
        """Generate a comprehensive summary of the article"""
        if not content or len(content.strip()) == 0:
            return ""
        
        try:
            prompt = f"""
            Please provide a comprehensive summary of the following news article in approximately {max_length} words. 
            The summary should capture the key facts, main points, and important details while being engaging and informative.
            
            Article:
            {content[:4000]}  # Limit content to avoid token limits
            
            Summary:
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional news editor who creates clear, accurate, and engaging summaries of news articles."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            logger.info(f"✅ Generated summary: {len(summary)} characters")
            return summary
            
        except Exception as e:
            logger.error(f"❌ Error generating summary: {e}")
            # Fallback to simple truncation
            sentences = content.split('. ')
            return '. '.join(sentences[:3]) + '.' if len(sentences) > 3 else content[:max_length]
    
    async def generate_short_summary(self, content: str) -> str:
        """Generate a short 60-100 word summary for quick reads"""
        if not content or len(content.strip()) == 0:
            return ""
        
        try:
            prompt = f"""
            Create a very concise summary of this news article in exactly 60-100 words. 
            Focus on the most important facts and make it suitable for quick reading.
            
            Article:
            {content[:3000]}
            
            Short Summary (60-100 words):
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a news editor specializing in creating brief, impactful summaries for busy readers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.2
            )
            
            short_summary = response.choices[0].message.content.strip()
            word_count = len(short_summary.split())
            
            logger.info(f"✅ Generated short summary: {word_count} words")
            return short_summary
            
        except Exception as e:
            logger.error(f"❌ Error generating short summary: {e}")
            # Fallback to word limit truncation
            words = content.split()[:80]
            return ' '.join(words) + '...' if len(words) == 80 else ' '.join(words)
    
    async def generate_headline_alternatives(self, original_title: str, content: str) -> list:
        """Generate alternative headlines for A/B testing"""
        try:
            prompt = f"""
            Given this news article title and content, create 3 alternative headlines that are:
            1. More engaging and clickable
            2. SEO-optimized
            3. Accurate to the content
            
            Original Title: {original_title}
            
            Content Summary: {content[:1000]}
            
            Provide 3 alternative headlines, one per line:
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a digital marketing expert who creates compelling, SEO-friendly headlines."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.4
            )
            
            alternatives = response.choices[0].message.content.strip().split('\n')
            alternatives = [alt.strip() for alt in alternatives if alt.strip()]
            
            logger.info(f"✅ Generated {len(alternatives)} alternative headlines")
            return alternatives
            
        except Exception as e:
            logger.error(f"❌ Error generating headline alternatives: {e}")
            return []
    
    async def extract_key_quotes(self, content: str) -> list:
        """Extract key quotes from the article"""
        try:
            prompt = f"""
            Extract the 3 most important and impactful quotes from this news article.
            Only include direct quotes that are properly attributed to speakers.
            Format as: "Quote" - Speaker Name, Title/Organization
            
            Article:
            {content[:4000]}
            
            Key Quotes:
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a journalist who identifies the most newsworthy quotes from articles."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.1
            )
            
            quotes_text = response.choices[0].message.content.strip()
            quotes = [quote.strip() for quote in quotes_text.split('\n') if quote.strip()]
            
            logger.info(f"✅ Extracted {len(quotes)} key quotes")
            return quotes
            
        except Exception as e:
            logger.error(f"❌ Error extracting quotes: {e}")
            return []
    
    async def generate_social_media_posts(self, title: str, summary: str) -> dict:
        """Generate social media posts for different platforms"""
        try:
            prompt = f"""
            Create social media posts for this news article for different platforms:
            
            Title: {title}
            Summary: {summary}
            
            Create:
            1. Twitter post (under 280 characters, include relevant hashtags)
            2. Facebook post (engaging, 1-2 sentences)
            3. LinkedIn post (professional tone, 2-3 sentences)
            
            Format as:
            Twitter: [post]
            Facebook: [post]
            LinkedIn: [post]
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a social media manager who creates engaging posts for news content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.4
            )
            
            posts_text = response.choices[0].message.content.strip()
            
            # Parse the response
            posts = {}
            current_platform = None
            
            for line in posts_text.split('\n'):
                line = line.strip()
                if line.startswith('Twitter:'):
                    current_platform = 'twitter'
                    posts[current_platform] = line.replace('Twitter:', '').strip()
                elif line.startswith('Facebook:'):
                    current_platform = 'facebook'
                    posts[current_platform] = line.replace('Facebook:', '').strip()
                elif line.startswith('LinkedIn:'):
                    current_platform = 'linkedin'
                    posts[current_platform] = line.replace('LinkedIn:', '').strip()
                elif current_platform and line:
                    posts[current_platform] += ' ' + line
            
            logger.info(f"✅ Generated social media posts for {len(posts)} platforms")
            return posts
            
        except Exception as e:
            logger.error(f"❌ Error generating social media posts: {e}")
            return {}

# Example usage
if __name__ == "__main__":
    async def test_summarizer():
        summarizer = NewsSummarizer()
        
        sample_content = """
        Breaking: The Federal Reserve announced today a significant change in interest rates, 
        raising the federal funds rate by 0.25 percentage points to combat rising inflation. 
        This marks the third rate hike this year as the central bank continues its aggressive 
        monetary policy stance. Federal Reserve Chair Jerome Powell stated in a press conference 
        that the decision was unanimous among voting members and reflects the committee's 
        commitment to bringing inflation back to the 2% target. The rate increase is expected 
        to impact borrowing costs for consumers and businesses, potentially slowing economic 
        growth but helping to cool inflationary pressures that have persisted throughout the year.
        """
        
        summary = await summarizer.generate_summary(sample_content)
        short_summary = await summarizer.generate_short_summary(sample_content)
        
        print("Original Content:")
        print(sample_content)
        print("\nSummary:")
        print(summary)
        print("\nShort Summary:")
        print(short_summary)
    
    asyncio.run(test_summarizer())
