import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World",
  description: "International news, global affairs, geopolitics, and world events coverage from every continent on NewsTRNT.",
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return children;
}
