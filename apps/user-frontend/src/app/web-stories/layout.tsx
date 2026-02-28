import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Stories",
  description: "Immersive, visual web stories that bring the news to life. Swipe through bite-sized stories on the topics you care about.",
  openGraph: {
    title: "Web Stories | NewsTRNT",
    description: "Immersive visual web stories — news that comes to life.",
  },
};

export default function WebStoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
