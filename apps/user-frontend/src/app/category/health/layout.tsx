import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health",
  description: "Health and wellness news, medical breakthroughs, fitness, mental health, and public health coverage on NewsTRNT.",
};

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
