import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to complete your NewsTRNT account setup.",
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
