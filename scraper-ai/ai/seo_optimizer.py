"""
SEO Optimizer for NewsNerve Platform
Optimizes article content for search engines and readability
"""

import logging
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from urllib.parse import quote_plus
import json

@dataclass
class SEOAnalysis:
    """Results of SEO analysis"""
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
    """
    Optimizes content for SEO and readability
    Generates meta descriptions, slugs, and provides optimization suggestions
    """
    
    def __init__(self):
        self.stop_words = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'but', 'or', 'not', 'this', 'they',
            'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time',
            'into', 'only', 'so', 'his', 'her', 'like', 'can', 'could', 'would'
        }
        
        # SEO best practices
        self.ideal_title_length = (50, 60)
        self.ideal_meta_description_length = (150, 160)
        self.ideal_paragraph_length = (150, 300)
        self.max_sentence_length = 25
    
    def generate_slug(self, title: str) -> str:
        """
        Generate SEO-friendly URL slug from title
        
        Args:
            title: Article title
            
        Returns:
            URL-safe slug
        """
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        # Remove stop words for shorter, more meaningful slugs
        words = slug.split('-')
        meaningful_words = [word for word in words if word not in self.stop_words]
        
        # Keep at least 3 words even if they're stop words
        if len(meaningful_words) < 3:
            meaningful_words = words[:5]
        
        return '-'.join(meaningful_words[:8])  # Limit to 8 words max
    
    def extract_keywords(self, title: str, content: str, max_keywords: int = 10) -> List[str]:
        """
        Extract relevant keywords from content
        
        Args:
            title: Article title
            content: Article content
            max_keywords: Maximum number of keywords to return
            
        Returns:
            List of relevant keywords
        """
        # Combine title and content, giving title more weight
        combined_text = f"{title} {title} {content}"
        
        # Clean and tokenize
        text = re.sub(r'[^\w\s]', ' ', combined_text.lower())
        words = text.split()
        
        # Filter out stop words and short words
        filtered_words = [
            word for word in words 
            if len(word) > 3 and word not in self.stop_words
        ]
        
        # Count word frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:max_keywords] if freq > 1]
    
    def optimize_title(self, title: str, keywords: List[str]) -> str:
        """
        Optimize title for SEO
        
        Args:
            title: Original title
            keywords: Target keywords
            
        Returns:
            Optimized title
        """
        optimized = title.strip()
        
        # Ensure primary keyword is near the beginning
        if keywords and keywords[0].lower() not in title.lower()[:30]:
            # Try to incorporate primary keyword naturally
            words = optimized.split()
            if len(words) > 2:
                optimized = f"{keywords[0].title()} in {' '.join(words)}"
        
        # Ensure title is within ideal length
        if len(optimized) > self.ideal_title_length[1]:
            words = optimized.split()
            # Keep reducing until we're under the limit
            while len(' '.join(words)) > self.ideal_title_length[1] and len(words) > 3:
                words.pop()
            optimized = ' '.join(words)
        
        # Add compelling elements if too short
        if len(optimized) < self.ideal_title_length[0]:
            compelling_words = ["Guide", "Tips", "Latest", "New", "Breaking", "Complete"]
            for word in compelling_words:
                if word.lower() not in optimized.lower():
                    potential = f"{optimized}: {word}"
                    if len(potential) <= self.ideal_title_length[1]:
                        optimized = potential
                        break
        
        return optimized
    
    def generate_meta_description(self, title: str, content: str, keywords: List[str]) -> str:
        """
        Generate optimized meta description
        
        Args:
            title: Article title
            content: Article content
            keywords: Target keywords
            
        Returns:
            Optimized meta description
        """
        # Extract first meaningful paragraph or use first 200 chars
        sentences = content.split('.')
        first_sentences = []
        char_count = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and char_count + len(sentence) < 140:
                first_sentences.append(sentence)
                char_count += len(sentence) + 1
            else:
                break
        
        description = '. '.join(first_sentences)
        
        # Ensure it includes primary keyword
        if keywords and keywords[0].lower() not in description.lower():
            description = f"Learn about {keywords[0]}. {description}"
        
        # Ensure proper length
        if len(description) > self.ideal_meta_description_length[1]:
            description = description[:self.ideal_meta_description_length[1] - 3] + "..."
        
        # Add call to action if there's space
        if len(description) < self.ideal_meta_description_length[0]:
            cta_phrases = [" Read more.", " Get the latest updates.", " Stay informed."]
            for cta in cta_phrases:
                if len(description + cta) <= self.ideal_meta_description_length[1]:
                    description += cta
                    break
        
        return description
    
    def analyze_readability(self, content: str) -> Tuple[float, List[str]]:
        """
        Analyze content readability and provide suggestions
        
        Args:
            content: Article content
            
        Returns:
            Tuple of (readability_score, suggestions)
        """
        suggestions = []
        score = 100.0
        
        # Analyze sentence length
        sentences = [s.strip() for s in content.split('.') if s.strip()]
        if sentences:
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
            if avg_sentence_length > self.max_sentence_length:
                score -= 20
                suggestions.append(f"Average sentence length ({avg_sentence_length:.1f} words) is too long. Aim for under {self.max_sentence_length} words.")
        
        # Analyze paragraph length
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        long_paragraphs = [p for p in paragraphs if len(p) > self.ideal_paragraph_length[1]]
        if long_paragraphs:
            score -= len(long_paragraphs) * 10
            suggestions.append(f"Found {len(long_paragraphs)} paragraphs that are too long. Break them into smaller chunks.")
        
        # Check for passive voice (simple heuristic)
        passive_indicators = ['was', 'were', 'been', 'being']
        passive_count = sum(content.lower().count(word) for word in passive_indicators)
        total_words = len(content.split())
        passive_ratio = passive_count / total_words if total_words > 0 else 0
        
        if passive_ratio > 0.1:
            score -= 15
            suggestions.append("Consider using more active voice to improve readability.")
        
        # Check for transition words
        transition_words = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently']
        transition_count = sum(content.lower().count(word) for word in transition_words)
        if transition_count < len(paragraphs) / 3:
            score -= 10
            suggestions.append("Add more transition words to improve flow between ideas.")
        
        return max(score, 0), suggestions
    
    def analyze_content_seo(self, title: str, content: str, keywords: List[str]) -> Tuple[float, List[str]]:
        """
        Analyze content for SEO best practices
        
        Args:
            title: Article title
            content: Article content
            keywords: Target keywords
            
        Returns:
            Tuple of (seo_score, suggestions)
        """
        suggestions = []
        score = 100.0
        
        if not keywords:
            score -= 30
            suggestions.append("No keywords identified. Consider adding relevant keywords.")
            return score, suggestions
        
        primary_keyword = keywords[0].lower()
        content_lower = content.lower()
        
        # Keyword density check
        keyword_count = content_lower.count(primary_keyword)
        word_count = len(content.split())
        keyword_density = (keyword_count / word_count) * 100 if word_count > 0 else 0
        
        if keyword_density < 0.5:
            score -= 20
            suggestions.append(f"Keyword density ({keyword_density:.1f}%) is too low. Aim for 0.5-2%.")
        elif keyword_density > 3:
            score -= 15
            suggestions.append(f"Keyword density ({keyword_density:.1f}%) is too high. Reduce keyword stuffing.")
        
        # Check keyword placement
        first_paragraph = content.split('\n')[0] if content else ""
        if primary_keyword not in first_paragraph.lower():
            score -= 15
            suggestions.append("Primary keyword should appear in the first paragraph.")
        
        # Check for related keywords
        related_keywords = keywords[1:3] if len(keywords) > 1 else []
        missing_related = [kw for kw in related_keywords if kw.lower() not in content_lower]
        if missing_related:
            score -= 10
            suggestions.append(f"Consider adding related keywords: {', '.join(missing_related)}")
        
        # Content length check
        if word_count < 300:
            score -= 25
            suggestions.append(f"Content is too short ({word_count} words). Aim for at least 300 words.")
        elif word_count > 2000:
            suggestions.append(f"Content is very long ({word_count} words). Consider breaking into multiple articles.")
        
        return max(score, 0), suggestions
    
    def optimize(self, title: str, content: str, summary: str = "") -> SEOAnalysis:
        """
        Perform complete SEO optimization analysis
        
        Args:
            title: Article title
            content: Article content
            summary: Article summary (optional)
            
        Returns:
            SEOAnalysis with scores and optimized content
        """
        # Extract keywords
        keywords = self.extract_keywords(title, content + " " + summary)
        
        # Optimize title
        optimized_title = self.optimize_title(title, keywords)
        
        # Generate meta description
        meta_description = self.generate_meta_description(title, content, keywords)
        
        # Generate slug
        slug = self.generate_slug(title)
        
        # Analyze different aspects
        title_score = 100.0
        if len(title) < self.ideal_title_length[0] or len(title) > self.ideal_title_length[1]:
            title_score = 70.0
        
        meta_score = 100.0
        if len(meta_description) < self.ideal_meta_description_length[0]:
            meta_score = 80.0
        
        content_score, content_suggestions = self.analyze_content_seo(title, content, keywords)
        readability_score, readability_suggestions = self.analyze_readability(content)
        
        # Calculate overall score
        overall_score = (title_score + meta_score + content_score + readability_score) / 4
        
        # Combine all suggestions
        all_suggestions = content_suggestions + readability_suggestions
        
        return SEOAnalysis(
            score=overall_score,
            title_score=title_score,
            meta_description_score=meta_score,
            content_score=content_score,
            readability_score=readability_score,
            suggestions=all_suggestions,
            optimized_title=optimized_title,
            optimized_meta_description=meta_description,
            keywords=keywords,
            slug=slug
        )
    
    def generate_schema_markup(self, title: str, content: str, author: str, 
                             published_date: str, category: str, image_url: str = "") -> Dict:
        """
        Generate JSON-LD schema markup for article
        
        Args:
            title: Article title
            content: Article content
            author: Author name
            published_date: Publication date (ISO format)
            category: Article category
            image_url: Featured image URL
            
        Returns:
            Schema.org Article markup as dictionary
        """
        schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "articleBody": content[:500] + "..." if len(content) > 500 else content,
            "author": {
                "@type": "Person",
                "name": author
            },
            "publisher": {
                "@type": "Organization",
                "name": "NewsNerve",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://newsnerve.com/logo.png"
                }
            },
            "datePublished": published_date,
            "dateModified": published_date,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"https://newsnerve.com/article/{self.generate_slug(title)}"
            },
            "articleSection": category.title()
        }
        
        if image_url:
            schema["image"] = {
                "@type": "ImageObject",
                "url": image_url
            }
        
        return schema

# Example usage
if __name__ == "__main__":
    optimizer = SEOOptimizer()
    
    # Test article
    title = "AI Revolution in Healthcare Technology"
    content = """
    Artificial intelligence is transforming the healthcare industry in unprecedented ways. 
    Machine learning algorithms are now being used to diagnose diseases more accurately than human doctors.
    
    Recent studies show that AI can detect cancer in medical images with 94% accuracy. 
    This technology is revolutionizing how we approach medical diagnosis and treatment.
    
    Healthcare providers are implementing AI solutions to improve patient outcomes and reduce costs.
    The future of medicine will be heavily influenced by these technological advances.
    """
    
    analysis = optimizer.optimize(title, content)
    
    print(f"Overall SEO Score: {analysis.score:.1f}/100")
    print(f"Optimized Title: {analysis.optimized_title}")
    print(f"Meta Description: {analysis.optimized_meta_description}")
    print(f"Slug: {analysis.slug}")
    print(f"Keywords: {', '.join(analysis.keywords[:5])}")
    print("\nSuggestions:")
    for suggestion in analysis.suggestions:
        print(f"- {suggestion}")
