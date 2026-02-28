import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technology",
  description: "Technology news, product launches, AI developments, cybersecurity, and digital innovation coverage on NewsTRNT.",
};

export default function TechnologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
