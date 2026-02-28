import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press",
  description: "Press releases, media kits, and brand assets from NewsTRNT. For press inquiries, contact our communications team.",
  openGraph: {
    title: "Press | NewsTRNT",
    description: "NewsTRNT press releases, media kits, and brand resources.",
  },
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
