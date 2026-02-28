import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions governing your use of NewsTRNT. Understand your rights and responsibilities as a user.",
  openGraph: {
    title: "Terms of Service | NewsTRNT",
    description: "Terms and conditions governing your use of NewsTRNT.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
