import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the NewsTRNT team. Reach out for partnerships, press inquiries, feedback, or support.",
  openGraph: {
    title: "Contact Us | NewsTRNT",
    description: "Reach the NewsTRNT team for partnerships, feedback, or support.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
