-- Seed data for newstrnt Platform

-- Insert default categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Politics', 'politics', 'Political news and government affairs', '#E53E3E', '🏛️', 1),
('Technology', 'technology', 'Tech news, startups, and innovation', '#3182CE', '💻', 2),
('Business', 'business', 'Business news, markets, and economy', '#38A169', '💼', 3),
('Sports', 'sports', 'Sports news and updates', '#D69E2E', '⚽', 4),
('Entertainment', 'entertainment', 'Movies, music, and celebrity news', '#9F7AEA', '🎬', 5),
('Health', 'health', 'Health and medical news', '#ED8936', '🏥', 6),
('Science', 'science', 'Scientific discoveries and research', '#0BC5EA', '🔬', 7),
('World', 'world', 'International news and global affairs', '#E53E3E', '🌍', 8),
('Environment', 'environment', 'Climate change and environmental news', '#38A169', '🌱', 9),
('Education', 'education', 'Education news and academic updates', '#553C9A', '📚', 10);

-- Insert common tags
INSERT INTO tags (name, slug) VALUES
('Breaking News', 'breaking-news'),
('AI', 'ai'),
('Climate Change', 'climate-change'),
('Cryptocurrency', 'cryptocurrency'),
('COVID-19', 'covid-19'),
('Elections', 'elections'),
('Economy', 'economy'),
('Innovation', 'innovation'),
('Research', 'research'),
('Analysis', 'analysis'),
('Opinion', 'opinion'),
('Interview', 'interview'),
('Investigation', 'investigation'),
('Fact Check', 'fact-check'),
('Live Updates', 'live-updates');

-- Insert sample admin user
INSERT INTO users (email, username, full_name, is_admin, is_verified, email_verified, password_hash) VALUES
('admin@newstrnt.com', 'admin', 'newstrnt Admin', TRUE, TRUE, TRUE, '$2b$10$example.hash.here'),
('editor@newstrnt.com', 'editor', 'News Editor', FALSE, TRUE, TRUE, '$2b$10$example.hash.here');

-- Insert sample articles
WITH sample_category AS (
    SELECT id FROM categories WHERE slug = 'technology' LIMIT 1
),
sample_admin AS (
    SELECT id FROM users WHERE username = 'admin' LIMIT 1
)
INSERT INTO articles (
    title, 
    slug, 
    summary, 
    content, 
    short_content,
    author,
    source_name,
    category_id,
    published_at,
    is_published,
    is_featured,
    reading_time,
    created_by
) VALUES
(
    'AI Revolution Continues: New Breakthrough in Machine Learning',
    'ai-revolution-continues-new-breakthrough-machine-learning',
    'Researchers at leading tech companies have announced a significant breakthrough in machine learning algorithms that could reshape how AI systems learn and adapt.',
    'In a groundbreaking development that promises to accelerate the AI revolution, researchers have unveiled a new approach to machine learning that dramatically improves how artificial intelligence systems learn from data. The breakthrough, announced today, represents a significant step forward in making AI more efficient, accurate, and capable of handling complex real-world scenarios.',
    'Researchers announce a major breakthrough in machine learning algorithms that could dramatically improve AI efficiency and real-world applications.',
    'Tech Reporter',
    'newstrnt Tech',
    (SELECT id FROM sample_category),
    NOW() - INTERVAL '2 hours',
    TRUE,
    TRUE,
    3,
    (SELECT id FROM sample_admin)
),
(
    'Global Climate Summit Reaches Historic Agreement',
    'global-climate-summit-reaches-historic-agreement',
    'World leaders have reached a unprecedented agreement on climate action at the Global Climate Summit, setting ambitious targets for carbon reduction.',
    'In a historic moment for environmental policy, world leaders at the Global Climate Summit have reached a comprehensive agreement that sets the most ambitious carbon reduction targets in history. The agreement, signed by representatives from over 150 countries, outlines specific measures and timelines for achieving net-zero emissions by 2050.',
    'World leaders sign historic climate agreement with ambitious carbon reduction targets at Global Climate Summit.',
    'Environmental Correspondent',
    'newstrnt World',
    (SELECT id FROM categories WHERE slug = 'environment' LIMIT 1),
    NOW() - INTERVAL '4 hours',
    TRUE,
    FALSE,
    4,
    (SELECT id FROM sample_admin)
);

-- Link articles to tags
WITH ai_article AS (
    SELECT id FROM articles WHERE slug = 'ai-revolution-continues-new-breakthrough-machine-learning' LIMIT 1
),
climate_article AS (
    SELECT id FROM articles WHERE slug = 'global-climate-summit-reaches-historic-agreement' LIMIT 1
)
INSERT INTO article_tags (article_id, tag_id) VALUES
((SELECT id FROM ai_article), (SELECT id FROM tags WHERE slug = 'ai' LIMIT 1)),
((SELECT id FROM ai_article), (SELECT id FROM tags WHERE slug = 'innovation' LIMIT 1)),
((SELECT id FROM ai_article), (SELECT id FROM tags WHERE slug = 'research' LIMIT 1)),
((SELECT id FROM climate_article), (SELECT id FROM tags WHERE slug = 'climate-change' LIMIT 1)),
((SELECT id FROM climate_article), (SELECT id FROM tags WHERE slug = 'breaking-news' LIMIT 1));

-- Insert newsletter subscription preferences
INSERT INTO newsletter_subscriptions (email, frequency, categories) VALUES
('subscriber@example.com', 'daily', ARRAY[(SELECT id FROM categories WHERE slug = 'technology' LIMIT 1)]),
('weekly@example.com', 'weekly', ARRAY[(SELECT id FROM categories WHERE slug = 'business' LIMIT 1), (SELECT id FROM categories WHERE slug = 'politics' LIMIT 1)]);

-- Update tag usage counts
UPDATE tags SET usage_count = (
    SELECT COUNT(*) FROM article_tags WHERE tag_id = tags.id
);
