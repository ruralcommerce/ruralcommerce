import type { ReactNode } from 'react';
import { Lexend } from 'next/font/google';
import './globals.css';
import './rural-theme.css';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['300', '400', '500', '600', '700', '800'],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`rural-commerce min-h-screen overflow-x-hidden bg-[var(--rc-bg)] text-[#1E1E1E] antialiased ${lexend.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
