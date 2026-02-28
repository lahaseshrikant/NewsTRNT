import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports",
  description: "Sports news, match results, player updates, and athletic event coverage from cricket, football, and beyond.",
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
