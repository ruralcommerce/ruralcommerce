import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales, type Locale } from '@/i18n/request';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { getProjectLocaleKey } from '@/lib/project-locale';

const layoutMeta = {
  es: {
    title: 'Rural Commerce — Excedentes en negocios sostenibles',
    description:
      'Tecnología, gestión y acceso a mercados para convertir pérdidas en oportunidades. Hardware de precisión, software de gestión y metodología para el campo.',
  },
  'pt-BR': {
    title: 'Rural Commerce — Excedentes em negócios sustentáveis',
    description:
      'Tecnologia, gestão e acesso a mercados para converter perdas em oportunidades. Hardware de precisão, software de gestão e metodologia para o campo.',
  },
  en: {
    title: 'Rural Commerce — Surpluses into sustainable businesses',
    description:
      'Technology, management and market access to turn losses into opportunities. Precision hardware, management software and field methodology.',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const m = layoutMeta[getProjectLocaleKey(params.locale)];
  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: 'Rural Commerce',
      description: m.description,
    },
  };
}

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
