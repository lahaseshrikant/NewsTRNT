import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ArticleResponse {
  success: boolean;
  article: {
    title: string;
    summary?: string;
    imageUrl?: string;
    author?: string;
    publishedAt?: string;
    tags?: Array<{ name: string }> | string[];
  };
}

async function fetchArticle(slug: string): Promise<ArticleResponse["article"] | null> {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data: ArticleResponse = await res.json();
    return data.article || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return { title: "Opinion Not Found" };
  }

  const tags =
    article.tags?.map((t) => (typeof t === "string" ? t : t.name)) ?? [];

  return {
    title: article.title,
    description:
      article.summary ||
      `Opinion: "${article.title}" — a perspective on NewsTRNT.`,
    authors: article.author ? [{ name: article.author }] : [{ name: "NewsTRNT" }],
    keywords: tags,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      type: "article",
      publishedTime: article.publishedAt || undefined,
      authors: article.author ? [article.author] : ["NewsTRNT"],
      section: "Opinion",
      tags,
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary || undefined,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function OpinionSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "OpinionNewsArticle",
        headline: article.title,
        description: article.summary || "",
        image: article.imageUrl || undefined,
        datePublished: article.publishedAt || undefined,
        author: {
          "@type": article.author ? "Person" : "Organization",
          name: article.author || "NewsTRNT",
        },
        publisher: {
          "@type": "Organization",
          name: "NewsTRNT",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://newstrnt.com"}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://newstrnt.com"}/opinion/${slug}`,
        },
        articleSection: "Opinion",
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
