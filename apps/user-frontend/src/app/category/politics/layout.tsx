import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politics",
  description: "Latest political news, government updates, elections, and policy analysis from India and around the world.",
};

export default function PoliticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
