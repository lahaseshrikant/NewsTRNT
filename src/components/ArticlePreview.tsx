import React from 'react';

interface ArticlePreviewProps {
  title: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  title,
  summary,
  content,
  author,
  category,
  tags,
  imageUrl,
  publishDate,
  seoTitle,
  seoDescription
}) => {
  const formatDate = (date: string) => {
    if (!date) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Article Header */}
      <header className="mb-8">
        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {title || 'Untitled Article'}
        </h1>

        {/* Summary */}
        {summary && (
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-6">
          <span>By {author || 'Admin'}</span>
          <span className="mx-2">•</span>
          <time>{formatDate(publishDate || '')}</time>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {imageUrl && (
        <div className="mb-8">
          <img
            src={imageUrl}
            alt={title || 'Article image'}
            className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {content ? (
          <div 
            className="text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-slate-400 dark:text-slate-500 italic text-center py-12">
            Article content will appear here as you write...
          </div>
        )}
      </article>

      {/* SEO Preview Section */}
      {(seoTitle || seoDescription) && (
        <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
            🔍 SEO Preview
          </h3>
          <div className="space-y-3">
            <div className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer">
              {seoTitle || title}
            </div>
            <div className="text-green-700 dark:text-green-400 text-sm">
              https://newstrnt.com/article/{(title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">
              {seoDescription || summary || 'No description available'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePreview;