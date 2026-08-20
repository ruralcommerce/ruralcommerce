import type { Metadata } from 'next';
import { ProjectPageShell } from '@/components/ProjectPageShell';
import { ProjectTeamInviteAccept } from '@/components/ProjectTeamInviteAccept';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const titles = {
  es: 'Completar acceso del equipo',
  'pt-BR': 'Concluir acesso da equipe',
  en: 'Complete team access',
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return { title: titles[getLocaleKey(params.locale)] };
}

export default function TeamInvitePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { token?: string };
}) {
  const locale = getLocaleKey(params.locale);
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <ProjectPageShell
      locale={locale}
      currentPage="admin"
      contentClassName="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6 lg:px-8"
    >
      <ProjectTeamInviteAccept locale={locale} token={token} />
    </ProjectPageShell>
  );
}
