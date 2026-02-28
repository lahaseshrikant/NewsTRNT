import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NewsTRNT's privacy policy explains how we collect, use, and protect your personal data. Your privacy matters to us.",
  openGraph: {
    title: "Privacy Policy | NewsTRNT",
    description: "How NewsTRNT collects, uses, and protects your personal data.",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
