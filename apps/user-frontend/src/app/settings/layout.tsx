import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your NewsTRNT account settings — theme, notifications, privacy, and display preferences.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
