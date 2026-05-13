import type { ReactNode } from 'react';
import { Lexend } from 'next/font/google';
import './globals.css';
import './rural-theme.css';

const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`rural-commerce min-h-screen bg-[var(--rc-bg)] text-[#1E1E1E] antialiased ${lexend.variable}`}>
        {children}
      </body>
    </html>
  );
}
