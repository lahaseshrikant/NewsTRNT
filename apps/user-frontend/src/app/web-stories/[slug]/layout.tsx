import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface WebStoryResponse {
  success: boolean;
  webStory: {
    title: string;
    description?: string;
    coverImageUrl?: string;
    author?: string;
    publishedAt?: string;
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

  if (!story) {
    return { title: "Web Story Not Found" };
  }

  return {
    title: story.title,
    description:
      story.description ||
      `View "${story.title}" — an immersive visual web story on NewsTRNT.`,
    openGraph: {
      title: story.title,
      description: story.description || undefined,
      type: "article",
      publishedTime: story.publishedAt || undefined,
      images: story.coverImageUrl
        ? [
            {
              url: story.coverImageUrl,
              width: 1080,
              height: 1920,
              alt: story.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description || undefined,
      images: story.coverImageUrl ? [story.coverImageUrl] : [],
    },
  };
}

export default function WebStorySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
