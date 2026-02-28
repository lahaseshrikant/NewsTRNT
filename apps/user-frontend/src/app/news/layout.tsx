import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest News",
  description: "Read the latest news from around the world. Independent reporting on politics, technology, business, science, sports, and more — the stories others miss.",
  openGraph: {
    title: "Latest News | NewsTRNT",
    description: "Breaking news and in-depth stories from independent journalists. The road not taken in journalism.",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
