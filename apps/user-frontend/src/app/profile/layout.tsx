import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your NewsTRNT profile, preferences, and account details.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
