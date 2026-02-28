import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opinion",
  description: "Diverse perspectives and opinion pieces from thought leaders, columnists, and experts. Understand all sides of the story.",
  openGraph: {
    title: "Opinion | NewsTRNT",
    description: "Diverse perspectives and opinion pieces on current events and policy.",
  },
};

export default function OpinionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
