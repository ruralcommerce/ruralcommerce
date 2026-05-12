import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import './rural-theme.css';

const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export const metadata: Metadata = {
  title: 'Rural Commerce — Excedentes en negocios sostenibles',
  description:
    'Tecnología, gestión y acceso a mercados para convertir pérdidas en oportunidades. Hardware de precisión, software de gestión y metodología para el campo.',
  openGraph: {
    title: 'Rural Commerce',
    description: 'Transformamos excedentes en negocios sostenibles.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`rural-commerce min-h-screen bg-[var(--rc-bg)] text-[#1E1E1E] antialiased ${lexend.variable}`}>{children}</body>
    </html>
  );
}
