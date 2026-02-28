import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending News",
  description: "Stay on top of what's happening now. Trending stories, breaking news, and the most-read articles from diverse perspectives across the globe.",
  openGraph: {
    title: "Trending News | NewsTRNT",
    description: "The most important stories right now — curated from multiple sources for a complete picture.",
  },
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
