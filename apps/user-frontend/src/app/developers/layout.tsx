import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer API",
  description: "Access newsfeeds, articles, and market data programmatically with the NewsTRNT API. Documentation, SDKs, and developer resources.",
  openGraph: {
    title: "Developer API | NewsTRNT",
    description: "Programmatic access to news, articles, and market data via the NewsTRNT API.",
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
