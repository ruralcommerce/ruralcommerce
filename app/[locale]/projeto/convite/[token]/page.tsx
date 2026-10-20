import type { Metadata } from 'next';
import { ProjectInviteOnboarding } from '@/components/ProjectInviteOnboarding';
import { ProjectPageShell } from '@/components/ProjectPageShell';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Invitación al proyecto — Rural Commerce',
    metadataDescription: 'Completa registro, convenio y diagnóstico para integrarte a Impulso MiPyMEs.',
  },
  'pt-BR': {
    metadataTitle: 'Convite ao projeto — Rural Commerce',
    metadataDescription: 'Complete cadastro, convênio e diagnóstico para integrar-se ao Impulso MiPyMEs.',
  },
  en: {
    metadataTitle: 'Project invitation — Rural Commerce',
    metadataDescription: 'Complete registration, agreement and diagnosis to join Impulso MiPyMEs.',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = getLocaleKey(params.locale);
  return {
    title: copy[locale].metadataTitle,
    description: copy[locale].metadataDescription,
  };
}

export default function ProjectInvitePage({
  params,
}: {
  params: { locale: string; token: string };
}) {
  const locale = getLocaleKey(params.locale);

  return (
    <ProjectPageShell locale={locale} currentPage="inscricao">
      <ProjectInviteOnboarding locale={locale} token={params.token} />
    </ProjectPageShell>
  );
}
