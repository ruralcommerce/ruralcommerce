import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales, type Locale } from '@/i18n/request';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';

export const metadata: Metadata = {
  title: 'Rural Commerce — Excedentes en negocios sostenibles',
  description:
    'Tecnología, gestión y acceso a mercados para convertir pérdidas en oportunidades. Hardware de precisión, software de gestión y metodología para el campo.',
  openGraph: {
    title: 'Rural Commerce',
    description: 'Transformamos excedentes en negocios sostenibles.',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  // Validate that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <ScrollToTopButton />
    </NextIntlClientProvider>
  );
}
