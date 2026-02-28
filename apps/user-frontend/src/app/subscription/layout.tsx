import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description: "Unlock the full NewsTRNT experience. Choose from free, premium, and professional plans for ad-free reading, exclusive content, and more.",
  openGraph: {
    title: "Subscription Plans | NewsTRNT",
    description: "Choose the plan that fits your news consumption — from free to professional.",
  },
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
