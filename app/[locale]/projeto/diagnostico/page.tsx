import type { Metadata } from 'next';
import { ProjectDiagnosisForm } from '@/components/ProjectDiagnosisForm';
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

export default async function ProjectDiagnosticoPage({
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
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <RuralCommerceHeader
        navItems={headerNavItems}
        logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')}
      />

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="flex h-full w-full items-stretch pt-16 pb-1 sm:pt-20 sm:pb-2 lg:pt-24 lg:pb-3">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
            <ProjectFlowNav locale={locale} currentPage="diagnostico" className="mb-2" />
            <div className="flex max-h-[calc(100vh-theme(spacing.28))] min-h-0 flex-col overflow-hidden rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-[#E6EBF1] sm:p-3">
              <div className="flex h-full min-h-0 flex-col rounded-[26px] bg-white text-[#2F3336]">
                <div className="flex h-full min-h-0 flex-col p-2.5 sm:p-3 lg:p-4">
                  <ProjectDiagnosisForm locale={locale} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
