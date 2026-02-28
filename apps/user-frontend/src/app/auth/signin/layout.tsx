import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NewsTRNT account to access personalized news, saved articles, and reading preferences.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
