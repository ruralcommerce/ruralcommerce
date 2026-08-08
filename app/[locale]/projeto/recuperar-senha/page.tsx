import type { Metadata } from 'next';
import { ProjectPageShell } from '@/components/ProjectPageShell';
import { ProjectPasswordReset } from '@/components/ProjectPasswordReset';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Restablecer contraseña — Impulso MiPyMEs',
    metadataDescription: 'Recupera el acceso a tu perfil del proyecto Impulso MiPyMEs.',
  },
  'pt-BR': {
    metadataTitle: 'Redefinir senha — Impulso MiPyMEs',
    metadataDescription: 'Recupere o acesso ao seu perfil do projeto Impulso MiPyMEs.',
  },
  en: {
    metadataTitle: 'Reset password — Impulso MiPyMEs',
    metadataDescription: 'Recover access to your Impulso MiPyMEs project profile.',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = getLocaleKey(params.locale);
  return {
    title: copy[locale].metadataTitle,
    description: copy[locale].metadataDescription,
  };
}

export default function RecoverPasswordPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { email?: string; token?: string };
}) {
  const locale = getLocaleKey(params.locale);
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <ProjectPageShell
      locale={locale}
      currentPage="recuperar-senha"
      contentClassName="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6 lg:px-8"
    >
      <ProjectPasswordReset locale={locale} initialEmail={email} initialToken={token} />
    </ProjectPageShell>
  );
}
