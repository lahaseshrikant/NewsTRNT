import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how NewsTRNT uses cookies and similar technologies to improve your experience and deliver relevant content.",
  openGraph: {
    title: "Cookie Policy | NewsTRNT",
    description: "How NewsTRNT uses cookies to improve your reading experience.",
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
