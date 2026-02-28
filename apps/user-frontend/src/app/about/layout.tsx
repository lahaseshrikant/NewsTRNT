import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about NewsTRNT — our mission to deliver unbiased, multi-perspective news. Meet the team building the future of informed journalism.",
  openGraph: {
    title: "About Us | NewsTRNT",
    description: "Our mission: unbiased, multi-perspective news for every reader.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
