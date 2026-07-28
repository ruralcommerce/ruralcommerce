import type { Metadata } from 'next';
import { ProjectFlowNav } from '@/components/ProjectFlowNav';
import { ProjectPasswordReset } from '@/components/ProjectPasswordReset';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import {
  getBlockProps,
  getManagedPageLayout,
  LayoutSearchParams,
  parseJsonArray,
} from '@/lib/page-layout-runtime';
import { defaultProjectHeaderNav } from '@/lib/project-locale';

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

export default async function RecoverPasswordPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams & { email?: string; token?: string };
}) {
  const locale = getLocaleKey(params.locale);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    defaultProjectHeaderNav[locale]
  );
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <RuralCommerceHeader
        navItems={headerNavItems}
        logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')}
      />
      <main className="flex flex-1">
        <section className="w-full pt-20 pb-8 sm:pt-24 lg:pt-28">
          <div className="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6 lg:px-8">
            <ProjectFlowNav locale={locale} currentPage="perfil" className="mb-2" />
            <ProjectPasswordReset locale={locale} initialEmail={email} initialToken={token} />
          </div>
        </section>
      </main>
    </div>
  );
}
