import type { Metadata } from 'next';
import { ProjectAgreementForm } from '@/components/ProjectAgreementForm';
import { ProjectFlowNav } from '@/components/ProjectFlowNav';
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

export default async function ProjectConvenioPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    defaultProjectHeaderNav[locale]
  );
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <RuralCommerceHeader
        navItems={headerNavItems}
        logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')}
      />

      <main className="flex flex-1">
        <section className="w-full pt-20 pb-8 sm:pt-24 lg:pt-28">
          <div className="mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-6 lg:px-8">
            <ProjectFlowNav locale={locale} currentPage="convenio" className="mb-2" />
            <ProjectAgreementForm locale={locale} />
          </div>
        </section>
      </main>
    </div>
  );
}
