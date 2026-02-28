import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to common questions about using NewsTRNT. Browse FAQs, guides, and troubleshooting tips.",
  openGraph: {
    title: "Help Center | NewsTRNT",
    description: "FAQs, guides, and troubleshooting for NewsTRNT users.",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
