import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Browse the full sitemap of NewsTRNT. Find every section, category, and page on our platform.",
  robots: { index: false, follow: true },
};

export default function SitemapPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
