import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Need help with NewsTRNT? Contact our support team for account issues, technical problems, or general inquiries.",
  openGraph: {
    title: "Support | NewsTRNT",
    description: "Contact NewsTRNT support for account or technical help.",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
