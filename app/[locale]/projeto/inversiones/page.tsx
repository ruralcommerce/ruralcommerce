import type { Metadata } from 'next';
import { ProjectInvestmentForm } from '@/components/ProjectInvestmentForm';
import { ProjectPageShell } from '@/components/ProjectPageShell';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Mis compras y mejoras — Impulso MiPyMEs',
    metadataDescription: 'Registra inversiones del negocio con factura o recibo y firma electrónica.',
  },
  'pt-BR': {
    metadataTitle: 'Minhas compras e melhorias — Impulso MiPyMEs',
    metadataDescription: 'Registre investimentos do negócio com fatura ou recibo e assinatura eletrônica.',
  },
  en: {
    metadataTitle: 'My purchases and improvements — Impulso MiPyMEs',
    metadataDescription: 'Record business investments with an invoice or receipt and an electronic signature.',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = getLocaleKey(params.locale);
  return { title: copy[locale].metadataTitle, description: copy[locale].metadataDescription };
}

export default function ProjectInvestmentsPage({ params }: { params: { locale: string } }) {
  const locale = getLocaleKey(params.locale);
  return (
    <ProjectPageShell
      locale={locale}
      currentPage="inversiones"
      contentClassName="mx-auto flex w-full max-w-6xl flex-col px-3 sm:px-6 lg:px-8"
    >
      <ProjectInvestmentForm locale={locale} />
    </ProjectPageShell>
  );
}
