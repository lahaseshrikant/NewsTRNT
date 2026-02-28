import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Articles",
  description: "Your bookmarked articles and reading list on NewsTRNT.",
  robots: { index: false, follow: false },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
