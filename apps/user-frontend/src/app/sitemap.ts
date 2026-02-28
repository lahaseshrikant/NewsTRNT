import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://newstrnt.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with priority and frequency
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/for-you`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/analysis`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/opinion`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/web-stories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/shorts`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.7 },
    { url: `${BASE_URL}/the-divergence`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/press`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/developers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/subscription`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Category pages
  const categories = [
    'technology', 'politics', 'business', 'science', 'sports',
    'entertainment', 'health', 'world',
  ];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic article pages — fetch from API if available
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/articles?limit=500&status=published`, {
      next: { revalidate: 3600 }, // revalidate hourly
    });
    if (res.ok) {
      const data = await res.json();
      const articles = data.articles || data.data || [];
      articlePages = articles.map((article: any) => ({
        url: `${BASE_URL}/news/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || article.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Fail silently — articles will be indexed by crawlers
  }

  return [...staticPages, ...categoryPages, ...articlePages];
}
