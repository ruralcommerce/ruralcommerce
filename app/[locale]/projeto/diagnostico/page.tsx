import type { Metadata } from 'next';
import { ProjectDiagnosisForm } from '@/components/ProjectDiagnosisForm';
import { ProjectPageShell } from '@/components/ProjectPageShell';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Diagnóstico — Rural Commerce',
    metadataDescription: 'Formulario de diagnóstico del proyecto Rural Commerce para participantes aprobados.',
  },
  'pt-BR': {
    metadataTitle: 'Diagnóstico — Rural Commerce',
    metadataDescription: 'Formulário de diagnóstico do projeto Rural Commerce para participantes aprovados.',
  },
  en: {
    metadataTitle: 'Diagnosis — Rural Commerce',
    metadataDescription: 'Rural Commerce project diagnosis form for approved participants.',
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

export default function ProjectDiagnosticoPage({ params }: { params: { locale: string } }) {
  const locale = getLocaleKey(params.locale);

  return (
    <ProjectPageShell locale={locale} currentPage="diagnostico">
      <div className="rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-[#E6EBF1] sm:p-3 lg:p-4">
        <ProjectDiagnosisForm locale={locale} />
      </div>
    </ProjectPageShell>
  );
}
