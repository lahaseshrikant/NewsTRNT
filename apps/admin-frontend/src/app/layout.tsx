import React from'react';
import { Inter, Playfair_Display, JetBrains_Mono } from'next/font/google';
import'./globals.css';
import AdminClientWrapper from'@/components/layout/AdminClientWrapper';
import { ThemeProvider } from'@/contexts/ThemeContext';
import { ToastProvider } from'@/components/ui/ToastNotification';

const inter = Inter({
 variable:'--font-inter',
 subsets: ['latin'],
 display:'swap',
 preload: true,
 fallback: ['system-ui','-apple-system','sans-serif'],
});

const playfair = Playfair_Display({
 variable:'--font-playfair',
 subsets: ['latin'],
 display:'swap',
 weight: ['400','500','600','700','800'],
 fallback: ['Georgia','serif'],
});

const jetbrainsMono = JetBrains_Mono({
 variable:'--font-mono',
 subsets: ['latin'],
 display:'swap',
 preload: false,
 weight: ['400','500','700'],
 fallback: ['Consolas','monospace'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <script
 dangerouslySetInnerHTML={{
 __html: `(() => { try { const t = localStorage.getItem('theme'); if(t ==='dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) document.documentElement.classList.add('dark'); } catch(e){} })();`
 }}
 />
 </head>
 <body className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
 <ThemeProvider>
 <ToastProvider>
 <AdminClientWrapper>{children}</AdminClientWrapper>
 </ToastProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
