import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

async function fetchCategory(slug: string): Promise<CategoryResponse | null> {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}/info`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  const name = category?.name || capitalize(slug);
  const description =
    category?.description ||
    `Browse the latest ${name} news, articles, and analysis on NewsTRNT.`;

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} News | NewsTRNT`,
      description,
    },
  };
}

export default function CategorySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
