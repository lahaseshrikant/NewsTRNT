import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore NewsTRNT's suite of services — content licensing, news syndication, enterprise solutions, and custom API integrations.",
  openGraph: {
    title: "Services | NewsTRNT",
    description: "Content licensing, syndication, and enterprise news solutions.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
