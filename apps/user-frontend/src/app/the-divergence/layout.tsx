import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Divergence",
  description: "Original reporting and exclusive content from NewsTRNT. The Divergence explores stories from multiple angles — because the truth is never one-dimensional.",
  openGraph: {
    title: "The Divergence | NewsTRNT",
    description: "Original reporting that explores stories from every angle.",
  },
};

export default function TheDivergenceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
