import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shorts",
  description: "Quick news bites you can consume in under a minute. Stay informed on the go with NewsTRNT Shorts.",
  openGraph: {
    title: "Shorts | NewsTRNT",
    description: "Quick news bites — stay informed in under a minute.",
  },
};

export default function ShortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
