import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Science",
  description: "Science news, space exploration, climate research, biology, physics, and cutting-edge discoveries on NewsTRNT.",
};

export default function ScienceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
