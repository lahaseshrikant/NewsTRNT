import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join NewsTRNT — create a free account to get personalized news, save articles, and customize your reading experience.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
