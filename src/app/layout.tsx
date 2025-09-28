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
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "NewsTRNT - The Road Not Taken",
  description: "Discover stories that matter, from perspectives that challenge the mainstream. Alternative journalism powered by AI.",
  keywords: ["news", "alternative journalism", "independent news", "AI news", "diverse perspectives", "NewsTRNT"],
  authors: [{ name: "NewsTRNT Team" }],
  creator: "NewsTRNT",
  publisher: "NewsTRNT",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://NewsTRNT.com",
    title: "NewsTRNT - The Road Not Taken",
    description: "Stay informed with AI-curated news, personalized feeds, and breaking updates from trusted sources worldwide.",
    siteName: "NewsTRNT",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsTRNT - Your world. Your interests. Your news.",
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
      <head>
        {/* Early theme apply to avoid always-dark flash and ensure correct contrast before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const stored = localStorage.getItem('theme'); const mql = window.matchMedia('(prefers-color-scheme: dark)'); const prefersDark = mql.matches; const theme = stored === 'light' || stored === 'dark' ? stored : (stored === 'system' || !stored) ? (prefersDark ? 'dark' : 'light') : 'light'; const root = document.documentElement; if(!root.classList.contains('light') && !root.classList.contains('dark')) { root.classList.add(theme); } } catch(e) {} })();`
          }}
        />
      </head>
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
