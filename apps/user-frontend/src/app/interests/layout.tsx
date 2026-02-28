import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Interests",
  description: "Customize your NewsTRNT experience by selecting the topics and categories that matter to you.",
  robots: { index: false, follow: false },
};

export default function InterestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
