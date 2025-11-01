"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ArticleDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Mock article data
  const article = {
    id: 1,
    title: "AI Revolution Continues: New Breakthrough in Machine Learning Transforms Healthcare Diagnostics",
    summary: "Researchers at Stanford University announce a groundbreaking AI system that can diagnose rare diseases with 95% accuracy, potentially revolutionizing healthcare worldwide.",
    content: `
      <p>In a groundbreaking development that could transform the landscape of medical diagnostics, researchers at Stanford University have unveiled an artificial intelligence system capable of diagnosing rare diseases with unprecedented accuracy.</p>
      
      <p>The new AI system, dubbed "MedAI-Pro," has demonstrated an impressive 95% accuracy rate in identifying rare genetic disorders, autoimmune conditions, and complex syndromes that often stump even experienced physicians. This breakthrough represents a significant leap forward in the application of machine learning to healthcare.</p>
      
      <h2>Revolutionary Technology</h2>
      
      <p>The system works by analyzing a combination of patient symptoms, medical history, genetic markers, and imaging data. Unlike traditional diagnostic approaches that rely heavily on physician experience and intuition, MedAI-Pro processes vast amounts of medical literature and case studies to identify patterns invisible to the human eye.</p>
      
      <p>"What makes this system truly revolutionary is its ability to consider thousands of variables simultaneously," explains Dr. Sarah Chen, lead researcher on the project. "It can identify subtle correlations between symptoms that might seem unrelated to human physicians."</p>
      
      <h2>Real-World Impact</h2>
      
      <p>The implications of this technology extend far beyond academic research. For patients suffering from rare diseases, early and accurate diagnosis can mean the difference between effective treatment and years of uncertainty.</p>
      
      <p>Current statistics show that patients with rare diseases often wait an average of 7 years for an accurate diagnosis, visiting multiple specialists and undergoing numerous tests. MedAI-Pro could potentially reduce this timeline to weeks or even days.</p>
      
      <h2>Clinical Trials and Future Implementation</h2>
      
      <p>The research team has already begun clinical trials at three major medical centers across the United States. Initial results from the pilot program show promising outcomes, with the AI system successfully identifying conditions that had previously gone undiagnosed for months or years.</p>
      
      <p>Dr. Michael Rodriguez, Chief of Medicine at UCLA Medical Center, who is overseeing one of the trial sites, notes: "We've seen cases where MedAI-Pro identified rare genetic disorders in children who had been seen by dozens of specialists without a definitive diagnosis."</p>
      
      <h2>Challenges and Considerations</h2>
      
      <p>Despite the promising results, the researchers acknowledge several challenges that must be addressed before widespread implementation. These include ensuring patient data privacy, integrating the system with existing hospital infrastructure, and training medical staff to work effectively with AI-assisted diagnostics.</p>
      
      <p>Regulatory approval from the FDA will also be required before the system can be deployed in clinical settings. The research team expects this process to take approximately 18-24 months.</p>
      
      <h2>Looking Ahead</h2>
      
      <p>As the medical field continues to embrace artificial intelligence, developments like MedAI-Pro represent just the beginning of a technological revolution in healthcare. The potential for AI to augment human expertise and improve patient outcomes appears virtually limitless.</p>
      
      <p>The research team plans to expand the system's capabilities to include more common diseases and conditions, with the ultimate goal of creating a comprehensive diagnostic assistant that could be used in medical facilities worldwide.</p>
    `,
    imageUrl: '/api/placeholder/1200/600',
    category: 'Technology',
    publishedAt: '2024-08-02T14:30:00Z',
    updatedAt: '2024-08-02T15:45:00Z',
    readingTime: 8,
    author: {
      name: 'Dr. Alex Kumar',
      bio: 'Medical technology journalist with 15 years of experience covering AI in healthcare.',
      avatar: '/api/placeholder/150/150'
    },
    tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology', 'Stanford University'],
    isBreaking: true,
    viewCount: 12847,
    shareCount: 342
  };

  const relatedArticles = [
    {
      id: 2,
      title: 'The Future of Telemedicine in Rural Areas',
      imageUrl: '/api/placeholder/300/200',
      category: 'Healthcare',
      readingTime: 5
    },
    {
      id: 3,
      title: 'How AI is Revolutionizing Drug Discovery',
      imageUrl: '/api/placeholder/300/200',
      category: 'Technology',
      readingTime: 6
    },
    {
      id: 4,
      title: 'Medical Ethics in the Age of Artificial Intelligence',
      imageUrl: '/api/placeholder/300/200',
      category: 'Healthcare',
      readingTime: 7
    }
  ];

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById('article-content');
      if (article) {
        const scrollTop = window.scrollY;
        const docHeight = article.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const progress = Math.min(100, Math.max(0, scrollPercent * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const title = article.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/50 z-50">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Article Header */}
      <article className="bg-card">
  <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-primary">
                  {article.category}
                </Link>
                <span>/</span>
                <span className="text-foreground">Article</span>
              </div>
            </nav>

            {/* Article Meta */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                {article.isBreaking && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    BREAKING
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-semibold">
                  {article.category}
                </span>
                <span className="text-muted-foreground text-sm">
                  {article.readingTime} min read
                </span>
                <span className="text-muted-foreground text-sm">
                  {article.viewCount.toLocaleString()} views
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {article.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{article.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Published {formatDate(article.publishedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    🔖
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full transition-colors"
                    >
                      📤
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-10">
                        <div className="py-2">
                          <button
                            onClick={() => shareArticle('twitter')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => shareArticle('facebook')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => shareArticle('linkedin')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Share on LinkedIn
                          </button>
                          <button
                            onClick={() => shareArticle('copy')}
                            className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <div className="relative w-full h-96 md:h-[500px]">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Article Content */}
      <div className="bg-card border-t border-border">
  <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div 
                  id="article-content"
                  className="prose prose-lg max-w-none 
                    prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
                    prose-p:text-foreground prose-p:leading-relaxed prose-p:text-justify prose-p:mb-6
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline
                    prose-ul:text-foreground prose-ol:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:italic
                    dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Author Bio */}
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          About {article.author.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {article.author.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related Articles */}
                <div className="bg-card rounded-lg shadow-sm p-6 sticky top-20 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`}>
                        <div className="group cursor-pointer">
                          <div className="relative w-full h-24 mb-2">
                            <Image
                              src={relatedArticle.imageUrl}
                              alt={relatedArticle.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <h4 className="font-medium text-foreground text-sm group-hover:text-primary line-clamp-2">
                            {relatedArticle.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <span>{relatedArticle.category}</span>
                            <span>•</span>
                            <span>{relatedArticle.readingTime} min read</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
