import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Entertainment news, movie reviews, celebrity updates, music, TV shows, and pop culture stories on NewsTRNT.",
};

export default function EntertainmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
