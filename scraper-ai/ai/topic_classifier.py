"""
Topic Classifier for NewsNerve Platform
Classifies news articles into appropriate categories using ML
"""

import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import re

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    import pickle
    import os
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not available. Using rule-based classification.")

@dataclass
class ClassificationResult:
    """Result of topic classification"""
    category: str
    confidence: float
    top_keywords: List[str]

class TopicClassifier:
    """
    Classifies news articles into predefined categories
    Uses ML when available, falls back to rule-based classification
    """
    
    def __init__(self):
        self.categories = {
            'technology': ['tech', 'ai', 'artificial intelligence', 'software', 'hardware', 'computer', 'digital', 'internet', 'cyber', 'startup', 'innovation'],
            'politics': ['government', 'election', 'vote', 'president', 'congress', 'senate', 'policy', 'law', 'politics', 'political', 'democrat', 'republican'],
            'business': ['business', 'economy', 'financial', 'market', 'stock', 'investment', 'company', 'corporate', 'profit', 'revenue', 'economic'],
            'sports': ['sport', 'game', 'team', 'player', 'match', 'tournament', 'championship', 'football', 'basketball', 'baseball', 'soccer'],
            'health': ['health', 'medical', 'doctor', 'hospital', 'medicine', 'disease', 'treatment', 'healthcare', 'patient', 'virus', 'vaccine'],
            'science': ['science', 'research', 'study', 'discovery', 'scientist', 'experiment', 'scientific', 'laboratory', 'analysis', 'data'],
            'entertainment': ['movie', 'film', 'music', 'celebrity', 'entertainment', 'actor', 'actress', 'show', 'concert', 'album', 'award'],
            'world': ['international', 'global', 'world', 'country', 'nation', 'foreign', 'embassy', 'diplomatic', 'war', 'conflict'],
            'environment': ['climate', 'environment', 'green', 'renewable', 'pollution', 'carbon', 'emissions', 'sustainability', 'nature', 'conservation'],
            'education': ['education', 'school', 'university', 'student', 'teacher', 'learning', 'academic', 'college', 'curriculum', 'degree']
        }
        
        self.model = None
        self.vectorizer = None
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'topic_classifier.pkl')
        if os.path.exists(model_path) and SKLEARN_AVAILABLE:
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logging.info("Loaded pre-trained topic classification model")
            except Exception as e:
                logging.warning(f"Failed to load model: {e}")
    
    def _rule_based_classify(self, text: str) -> ClassificationResult:
        """
        Rule-based classification using keyword matching
        Fallback when ML model is not available
        """
        text_lower = text.lower()
        
        # Clean text for better matching
        text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
        words = text_clean.split()
        
        category_scores = {}
        matched_keywords = {}
        
        for category, keywords in self.categories.items():
            score = 0
            category_keywords = []
            
            for keyword in keywords:
                keyword_count = text_lower.count(keyword.lower())
                if keyword_count > 0:
                    score += keyword_count * len(keyword.split())  # Give more weight to longer phrases
                    category_keywords.extend([keyword] * keyword_count)
            
            if score > 0:
                category_scores[category] = score
                matched_keywords[category] = category_keywords
        
        if not category_scores:
            return ClassificationResult(
                category='general',
                confidence=0.1,
                top_keywords=[]
            )
        
        # Get best matching category
        best_category = max(category_scores.keys(), key=lambda k: category_scores[k])
        max_score = category_scores[best_category]
        total_score = sum(category_scores.values())
        confidence = max_score / total_score if total_score > 0 else 0.1
        
        return ClassificationResult(
            category=best_category,
            confidence=min(confidence, 0.95),  # Cap confidence for rule-based
            top_keywords=matched_keywords.get(best_category, [])[:5]
        )
    
    def _ml_classify(self, text: str) -> ClassificationResult:
        """ML-based classification using trained model"""
        if not self.model or not SKLEARN_AVAILABLE:
            return self._rule_based_classify(text)
        
        try:
            # This would use a pre-trained model
            # For now, fall back to rule-based
            return self._rule_based_classify(text)
        except Exception as e:
            logging.error(f"ML classification failed: {e}")
            return self._rule_based_classify(text)
    
    def classify(self, title: str, content: str = "", summary: str = "") -> ClassificationResult:
        """
        Classify an article into a category
        
        Args:
            title: Article title
            content: Full article content (optional)
            summary: Article summary (optional)
            
        Returns:
            ClassificationResult with category, confidence, and keywords
        """
        # Combine all text with title having highest weight
        combined_text = f"{title} {title} {summary} {content}"
        
        if SKLEARN_AVAILABLE and self.model:
            return self._ml_classify(combined_text)
        else:
            return self._rule_based_classify(combined_text)
    
    def get_category_keywords(self, category: str) -> List[str]:
        """Get keywords for a specific category"""
        return self.categories.get(category, [])
    
    def get_all_categories(self) -> List[str]:
        """Get list of all available categories"""
        return list(self.categories.keys())
    
    def train_model(self, training_data: List[Tuple[str, str]]) -> bool:
        """
        Train the ML model with labeled data
        
        Args:
            training_data: List of (text, category) tuples
            
        Returns:
            True if training successful, False otherwise
        """
        if not SKLEARN_AVAILABLE:
            logging.warning("Cannot train ML model: scikit-learn not available")
            return False
        
        try:
            texts, labels = zip(*training_data)
            
            # Create and train pipeline
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
                ('classifier', MultinomialNB())
            ])
            
            pipeline.fit(texts, labels)
            self.model = pipeline
            
            # Save model
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(model_dir, exist_ok=True)
            model_path = os.path.join(model_dir, 'topic_classifier.pkl')
            
            with open(model_path, 'wb') as f:
                pickle.dump(pipeline, f)
            
            logging.info(f"Model trained and saved to {model_path}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to train model: {e}")
            return False

# Example usage
if __name__ == "__main__":
    classifier = TopicClassifier()
    
    # Test classification
    test_articles = [
        ("AI Revolution in Healthcare", "Artificial intelligence is transforming medical diagnosis..."),
        ("Election Results 2024", "The presidential election results show..."),
        ("Climate Change Summit", "World leaders gather to discuss environmental policies...")
    ]
    
    for title, content in test_articles:
        result = classifier.classify(title, content)
        print(f"Title: {title}")
        print(f"Category: {result.category}")
        print(f"Confidence: {result.confidence:.2f}")
        print(f"Keywords: {result.top_keywords}")
        print("-" * 50)
