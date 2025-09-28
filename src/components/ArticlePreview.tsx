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
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {title || 'Untitled Article'}
        </h1>

        {/* Summary */}
        {summary && (
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            {summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center text-muted-foreground text-sm mb-6">
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
                className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-full text-sm font-medium transition-colors cursor-pointer"
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
      <article className="prose dark:prose-invert prose-lg max-w-none
                       prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
                       prose-h1:text-4xl prose-h1:mt-10 prose-h1:mb-6
                       prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                       prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                       prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-h4:font-semibold
                       prose-h5:text-base prose-h5:mt-4 prose-h5:mb-2 prose-h5:font-semibold
                       prose-h6:text-sm prose-h6:mt-3 prose-h6:mb-1 prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide
                       prose-p:text-foreground prose-p:leading-relaxed prose-p:text-lg prose-p:mb-4
                       prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                       prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                       prose-li:text-foreground prose-li:text-lg prose-li:mb-1 prose-li:leading-relaxed
                       prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:no-underline
                       prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                       prose-blockquote:text-blue-900 dark:prose-blockquote:text-blue-200 prose-blockquote:not-italic prose-blockquote:pl-6 prose-blockquote:py-4
                       prose-strong:text-foreground prose-strong:font-bold
                       prose-em:text-foreground prose-em:italic
                       prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
                       prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                       prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
                       prose-hr:border-border prose-hr:my-8
                       prose-table:border-collapse prose-table:border prose-table:border-border prose-table:my-6
                       prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-foreground prose-th:font-semibold
                       prose-td:border prose-td:border-border prose-td:p-3 prose-td:text-foreground
                       selection:bg-blue-100 dark:selection:bg-blue-900/30
                       text-foreground">
        {content ? (
          <div 
            className="article-preview-content text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-muted-foreground italic text-center py-12">
            Article content will appear here as you write...
          </div>
        )}
      </article>

      {/* SEO Preview Section */}
      {(seoTitle || seoDescription) && (
        <div className="mt-12 p-6 bg-muted rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            🔍 SEO Preview
          </h3>
          <div className="space-y-3">
            <div className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer">
              {seoTitle || title}
            </div>
            <div className="text-green-700 dark:text-green-400 text-sm">
              https://newstrnt.com/article/{(title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            </div>
            <div className="text-muted-foreground text-sm">
              {seoDescription || summary || 'No description available'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePreview;