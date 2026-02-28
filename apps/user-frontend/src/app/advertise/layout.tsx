import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise with Us",
  description: "Reach a highly-engaged audience of news readers. Explore advertising opportunities and partnerships with NewsTRNT.",
  openGraph: {
    title: "Advertise with NewsTRNT",
    description: "Advertising opportunities for brands targeting informed news readers.",
  },
};

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
