import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your NewsTRNT notifications — breaking news alerts, article recommendations, and account updates.",
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
