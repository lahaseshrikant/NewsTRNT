import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search NewsTRNT for articles, analysis, opinions, and stories across all categories. Find exactly what you're looking for.",
  openGraph: {
    title: "Search | NewsTRNT",
    description: "Find articles, analysis, and stories across all NewsTRNT categories.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
