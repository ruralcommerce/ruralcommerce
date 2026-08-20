import type { Metadata } from 'next';
import { ProjectAgreementForm } from '@/components/ProjectAgreementForm';
import { ProjectPageShell } from '@/components/ProjectPageShell';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Convenio de participación — Rural Commerce',
    metadataDescription: 'Firma el convenio de participación del proyecto Rural Commerce para continuar con el diagnóstico.',
  },
  'pt-BR': {
    metadataTitle: 'Convênio de participação — Rural Commerce',
    metadataDescription: 'Assine o convênio de participação do projeto Rural Commerce para continuar com o diagnóstico.',
  },
  en: {
    metadataTitle: 'Participation agreement — Rural Commerce',
    metadataDescription: 'Sign the Rural Commerce project participation agreement to continue with the diagnosis.',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = getLocaleKey(params.locale);
  const current = copy[locale];
  return {
    title: current.metadataTitle,
    description: current.metadataDescription,
  };
}

export default function ProjectConvenioPage({ params }: { params: { locale: string } }) {
  const locale = getLocaleKey(params.locale);

  return (
    <ProjectPageShell
      locale={locale}
      currentPage="convenio"
      contentClassName="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8"
    >
      <ProjectAgreementForm locale={locale} />
    </ProjectPageShell>
  );
}
