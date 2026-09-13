import '@/components/sementes/sementes.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sementes da Inovação — Rural Commerce',
  description: 'Planta tua semente. 15 minutos. Uma ideia. No palco, ninguém vê teu nome.',
};

export const viewport: Viewport = {
  themeColor: '#071F5E',
  width: 'device-width',
  initialScale: 1,
};

export default function SementesLayout({ children }: { children: ReactNode }) {
  return children;
}
