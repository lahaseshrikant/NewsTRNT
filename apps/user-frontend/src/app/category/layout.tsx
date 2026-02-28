import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s News | NewsTRNT",
    default: "Categories",
  },
  description: "Browse news by category — politics, business, technology, sports, entertainment, health, science, and world news on NewsTRNT.",
  openGraph: {
    title: "News Categories | NewsTRNT",
    description: "Browse every news category on NewsTRNT.",
  },
};

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
