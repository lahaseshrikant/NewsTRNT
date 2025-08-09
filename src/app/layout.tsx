import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LogoProvider } from "@/contexts/LogoContext";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewsNerve - Your world. Your interests. Your news.",
  description: "Stay informed with AI-curated news, personalized feeds, and breaking updates from trusted sources worldwide.",
  keywords: ["news", "breaking news", "AI news", "personalized news", "world news", "technology news"],
  authors: [{ name: "NewsNerve Team" }],
  creator: "NewsNerve",
  publisher: "NewsNerve",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newsnerve.com",
    title: "NewsNerve - Your world. Your interests. Your news.",
    description: "Stay informed with AI-curated news, personalized feeds, and breaking updates from trusted sources worldwide.",
    siteName: "NewsNerve",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsNerve - Your world. Your interests. Your news.",
    description: "Stay informed with AI-curated news, personalized feeds, and breaking updates from trusted sources worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdminProvider>
          <LogoProvider>
            <ThemeProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ThemeProvider>
          </LogoProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
