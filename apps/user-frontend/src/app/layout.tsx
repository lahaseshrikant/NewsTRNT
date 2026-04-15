import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LogoProvider } from "@/contexts/LogoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800', '900'],
  fallback: ['Georgia', 'serif'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '700'],
  fallback: ['Courier New', 'monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://newstrnt.com'),
  title: {
    default: "NewsTRNT - The Road Not Taken",
    template: "%s | NewsTRNT",
  },
  description: "Discover stories that matter, from perspectives that challenge the mainstream. Independent journalism powered by AI, bringing you diverse viewpoints and underreported stories.",
  keywords: ["news", "alternative journalism", "independent news", "AI news", "diverse perspectives", "NewsTRNT", "Indian news", "breaking news", "analysis", "opinion"],
  authors: [{ name: "NewsTRNT Team", url: "https://newstrnt.com" }],
  creator: "NewsTRNT",
  publisher: "NewsTRNT",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://newstrnt.com",
    title: "NewsTRNT - The Road Not Taken",
    description: "Independent journalism bringing you diverse perspectives and underreported stories. Breaking news, in-depth analysis, and editorial opinion.",
    siteName: "NewsTRNT",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsTRNT - The Road Not Taken",
    description: "Independent journalism bringing you diverse perspectives and underreported stories.",
    creator: "@NewsTRNT",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://newstrnt.com',
  },
  verification: {
    // Add when you have these:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
        {/* Organization + WebSite JSON-LD for Google Knowledge Panel & Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "NewsTRNT",
                url: "https://newstrnt.com",
                logo: "https://newstrnt.com/logo.png",
                sameAs: [
                  "https://twitter.com/NewsTRNT",
                  // Add other social profiles when available
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  url: "https://newstrnt.com/support",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "NewsTRNT",
                url: "https://newstrnt.com",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://newstrnt.com/search?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {/* Early theme apply to avoid always-dark flash and ensure correct contrast before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const stored = localStorage.getItem('theme'); const mql = window.matchMedia('(prefers-color-scheme: dark)'); const prefersDark = mql.matches; const theme = stored === 'light' || stored === 'dark' ? stored : (stored === 'system' || !stored) ? (prefersDark ? 'dark' : 'light') : 'light'; const root = document.documentElement; if(!root.classList.contains('light') && !root.classList.contains('dark')) { root.classList.add(theme); } } catch(e) {} })();`
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <LogoProvider>
          <ThemeProvider>
            <AuthProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </AuthProvider>
          </ThemeProvider>
        </LogoProvider>
      </body>
    </html>
  );
}
