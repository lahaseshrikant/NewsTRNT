import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse the full library of NewsTRNT articles — breaking news, feature stories, analysis, and opinion from trusted sources.",
  openGraph: {
    title: "Articles | NewsTRNT",
    description: "Browse every article on NewsTRNT — breaking news to deep analysis.",
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
