import React from 'react';
import './globals.css';
import AdminClientWrapper from '@/components/layout/AdminClientWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AdminClientWrapper>{children}</AdminClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
