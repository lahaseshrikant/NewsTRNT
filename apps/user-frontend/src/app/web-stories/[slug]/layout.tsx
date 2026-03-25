import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://newstrnt.com';

interface WebStoryResponse {
  success: boolean;
  webStory: {
    slug?: string;
    title: string;
    description?: string;
    coverImage?: string;
    coverImageUrl?: string;
    author?: string;
    publishedAt?: string;
    updatedAt?: string;
    category?: string;
    slides?: Array<{ content?: { headline?: string; text?: string; image?: string; video?: string } }>;
    tags?: string[];
  };
}

async function fetchWebStory(
  slug: string
): Promise<WebStoryResponse["webStory"] | null> {
  try {
    const res = await fetch(`${API_URL}/webstories/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data: WebStoryResponse = await res.json();
    return data.webStory || null;
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
  const story = await fetchWebStory(slug);
  const canonical = `${SITE_URL}/web-stories/${slug}`;
  const ampUrl = `${canonical}/amp`;

  if (!story) {
    return {
      title: 'Web Story Not Found',
      alternates: {
        canonical,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const inferredDescription =
    story.description ||
    story.slides
      ?.map((slide) => [slide?.content?.headline, slide?.content?.text].filter(Boolean).join('. '))
      .filter(Boolean)
      .join(' ')
      .slice(0, 240);

  const description =
    inferredDescription ||
    `View \"${story.title}\" — an immersive visual web story on NewsTRNT.`;

  const coverImage = story.coverImage || story.coverImageUrl || story.slides?.[0]?.content?.image || story.slides?.[0]?.content?.video;
  const tags = [story.category, ...(story.tags || [])].filter(Boolean) as string[];

  return {
    title: story.title,
    description,
    alternates: {
      canonical,
      types: {
        'application/amp+html': ampUrl,
      },
    },
    openGraph: {
      title: story.title,
      description,
      type: "article",
      url: canonical,
      publishedTime: story.publishedAt || undefined,
      modifiedTime: story.updatedAt || story.publishedAt || undefined,
      images: coverImage
        ? [
            {
              url: coverImage,
              width: 1080,
              height: 1920,
              alt: story.title,
            },
          ]
        : [],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: coverImage ? [coverImage] : [],
    },
    keywords: tags,
  };
}

export default function WebStorySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
