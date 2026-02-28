import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business",
  description: "Business news, market updates, corporate earnings, startup stories, and economic analysis on NewsTRNT.",
};

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
