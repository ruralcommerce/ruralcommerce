import type { Metadata } from 'next';
import { ProjectEnrollmentForm } from '@/components/ProjectEnrollmentForm';
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
    metadataTitle: 'Inscripción — Rural Commerce',
    metadataDescription: 'Página dedicada para registrar el interés en el proyecto Rural Commerce y coordinar el próximo paso.',
    eyebrow: 'Inscripción',
    title: 'Registra tu interés en el proyecto',
    text: 'Completa el formulario para que el equipo entienda tu operación, tus objetivos y la mejor forma de acompañarte.',
    note: 'Después del envío, podrás consultar tu perfil y seguir el proceso de acompañamiento.',
    nextStepsTitle: '¿Qué pasa después?',
    nextSteps: [
      'El equipo revisa la inscripción y confirma el próximo paso.',
      'Recibes respuesta sobre el estado del proceso.',
      'El perfil de participación queda disponible para seguimiento.',
    ],
  },
  'pt-BR': {
    metadataTitle: 'Inscrição — Rural Commerce',
    metadataDescription: 'Página dedicada para registrar o interesse no projeto Rural Commerce e coordinar o próximo passo.',
    eyebrow: 'Inscrição',
    title: 'Registre seu interesse no projeto',
    text: 'Preencha o formulário para que a equipe entenda sua operação, seus objetivos e a melhor forma de apoiar seu negócio.',
    note: 'Após o envio, você poderá consultar seu perfil e acompanhar o processo de apoio.',
    nextStepsTitle: 'O que acontece depois',
    nextSteps: [
      'O time revisa a inscrição e confirma o próximo passo.',
      'Você recebe retorno sobre o status do processo.',
      'O perfil da participação fica disponível para acompanhamento.',
    ],
  },
  en: {
    metadataTitle: 'Application — Rural Commerce',
    metadataDescription: 'Dedicated page to register interest in the Rural Commerce project and coordinate the next step.',
    eyebrow: 'Application',
    title: 'Register your interest in the project',
    text: 'Complete the form so the team can understand your operation, your goals and the best way to support your business.',
    note: 'After submission, you can review your profile and follow the support process.',
    nextStepsTitle: 'What happens next',
    nextSteps: [
      'The team reviews the application and confirms the next step.',
      'You receive a response about the status of the process.',
      'Your participation profile is available for follow-up.',
    ],
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

export default async function ProjectInscricaoPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const current = copy[locale];
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
            <ProjectFlowNav locale={locale} currentPage="inscricao" className="mb-2" />
            <div className="flex max-h-[calc(100vh-theme(spacing.28))] min-h-0 flex-col overflow-hidden rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-[#E6EBF1] sm:p-3">
              <div className="flex h-full min-h-0 flex-col rounded-[26px] bg-white text-[#2F3336]">
                <div className="flex h-full min-h-0 flex-col p-2.5 sm:p-3 lg:p-4">
                  <ProjectEnrollmentForm
                    locale={locale}
                    eyebrow={current.eyebrow}
                    introTitle={current.title}
                    introText={current.text}
                    introNote={current.note}
                    nextStepsTitle={current.nextStepsTitle}
                    nextSteps={current.nextSteps}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
