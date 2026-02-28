import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis",
  description: "In-depth analysis and expert commentary on the stories that matter. Go beyond headlines with thoughtful reporting and data-driven insights.",
  openGraph: {
    title: "Analysis | NewsTRNT",
    description: "Expert analysis and commentary on current events — deeper than the headline.",
  },
};

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
