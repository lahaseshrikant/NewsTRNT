import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the NewsTRNT team and help build the future of news. Explore open positions in engineering, journalism, design, and more.",
  openGraph: {
    title: "Careers | NewsTRNT",
    description: "Build the future of news — explore open roles at NewsTRNT.",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
