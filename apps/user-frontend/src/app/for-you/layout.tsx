import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For You",
  description: "Your personalized news feed powered by your interests and reading habits. Curated stories that match what matters to you.",
  openGraph: {
    title: "For You | NewsTRNT",
    description: "A personalized news feed curated from your interests and reading habits.",
  },
};

export default function ForYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
