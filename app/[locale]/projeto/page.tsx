import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, ChartNoAxesCombined, Leaf, Sparkles } from 'lucide-react';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter as SiteFooter } from '@/components/RuralCommerceFooter';
import {
  getBlockProps,
  getManagedPageLayout,
  LayoutSearchParams,
  parseJsonArray,
} from '@/lib/page-layout-runtime';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    metadataTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    metadataDescription:
      'Fortalecimiento de capacidades empresariales, financieras y digitales para 60 MIPYMEs agroalimentarias rurales en Los Santos, con enfoque en exportación y trazabilidad de bajo costo.',
    heroEyebrow: 'Impulsa Mipymes',
    heroTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    heroText:
      'Fortalecimiento de capacidades empresariales, financieras y digitales para 60 MIPYMEs agroalimentarias rurales en Los Santos, con enfoque en exportación y trazabilidad de bajo costo.',
    heroCtaPrimary: 'Inscribirme al proyecto',
    heroChips: ['Formación', 'Innovación', 'Eficiencia Productiva', 'Digitalización', 'Comercialización'],
    sectionGoalsEyebrow: 'Objetivos',
    sectionGoalsTitle: 'Objetivos y Resultados',
    sectionGoalsText:
      'Mejora de la competitividad, la productividad y la preparación para la exportación de las micro, pequeñas y medianas empresas agroalimentarias participantes en la región de Los Santos, en Costa Rica.',
    goalCards: [
      {
        title: 'Gestión y Digitalización',
        body: [
          'Fortalecimiento de capacidades empresariales, financieras y digitales.',
        ],
      },
      {
        title: 'Maquila / Biorrefinería',
        body: [
          'Instalación de biorrefinería compartida para el procesamiento de alimentos con valor agregado',
        ],
      },
      {
        title: 'Automatización',
        body: [
          'Implementación de sensores para monitorear procesos y optimizar la eficiencia operativa',
        ],
      },
      {
        title: 'Red de Comercialización',
        body: [
          'Creación de red comercialización para facilitar el acceso a mercados nacionales e internacionales.',
        ],
      },
    ],
    sectionProcessTitle: 'Efectos Multiplicadores',
    processSteps: [
      {
        title: 'Capacitación de formadores para extender alcance sin recursos externos',
        body: '',
      },
      {
        title: 'Red de comercialización que atrae nuevos productores y mejora condiciones de mercado',
        body: '',
      },
      {
        title: 'Documentación abierta para replicación en otras cooperativas y regiones',
        body: '',
      },
      {
        title: 'Difusión de aprendizajes y resultados a actores clave y sector público',
        body: '',
      },
    ],
    sectionImpactTitle: 'Resultados que buscamos',
    impactStats: [
      { value: '60', label: 'MIPYMEs Apoyadas' },
      { value: '80', label: 'Horas Formación y asistencia técnica' },
      { value: '1', label: 'Maquila biorrefinaría Instalada' },
      { value: '10', label: 'Kits de Monitoreo y automación' },
      { value: '60', label: 'Planes de Negocio' },
    ],
    sectionMultipliersTitle: 'Efectos Multiplicadores',
    multipliersCards: [
      'Capacitación de formadores para extender alcance sin recursos externos',
      'Red de comercialización que atrae nuevos productores y mejora condiciones de mercado',
      'Documentación abierta para replicación en otras cooperativas y regiones',
      'Difusión de aprendizajes y resultados a actores clave y sector público',
    ],
    sectionParticipationEyebrow: 'Cómo participar',
    sectionParticipationTitle: 'Elige el siguiente paso con claridad',
    sectionInscriptionTitle: 'Inscripción para participar',
    sectionInscriptionText:
      'La inscripción nos permite conocer mejor tu contexto, entender tu interés y coordinar el próximo paso del acompañamiento.',
    inscriptionLabel: 'Formulario de inscripción',
    inscriptionNote: 'Completa tus datos para que el equipo pueda revisar tu perfil y orientar la mejor ruta de apoyo.',
    sectionDiagnosisTitle: 'Diagnóstico del emprendimiento',
    sectionDiagnosisText:
      'El diagnóstico ayuda a identificar prioridades, oportunidades y los puntos donde el proyecto puede aportar más valor.',
    diagnosisLabel: 'Diagnóstico inicial',
    diagnosisNote: 'Este análisis sirve como base para definir la estrategia más adecuada para cada participante.',
    sectionClosingTitle: '¿Listo para dar el siguiente paso?',
    sectionClosingText:
      'Desde la inscripción hasta el diagnóstico, el proyecto busca acompañar decisiones concretas con claridad, foco y seguimiento real.',
    closingCtaPrimary: 'Quiero participar',
    closingCtaSecondary: 'Quiero el diagnóstico',
  },
  'pt-BR': {
    metadataTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    metadataDescription:
      'Fortalecimento de capacidades empresariais, financeiras e digitais para 60 MIPYMEs agroalimentares rurais em Los Santos, com foco em exportação e rastreabilidade de baixo custo.',
    heroEyebrow: 'Impulsa Mipymes',
    heroTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    heroText:
      'Fortalecimento de capacidades empresariais, financeiras e digitais para 60 MIPYMEs agroalimentares rurais em Los Santos, com foco em exportação e rastreabilidade de baixo custo.',
    heroCtaPrimary: 'Me inscrever no projeto',
    heroChips: ['Formação', 'Inovação', 'Eficiência Produtiva', 'Digitalização', 'Comercialização'],
    sectionGoalsEyebrow: 'Objetivos',
    sectionGoalsTitle: 'Objetivos e Resultados',
    sectionGoalsText:
      'Melhoria da competitividade, produtividade e preparação para a exportação das micro, pequenas e médias empresas agroalimentares participantes na região de Los Santos, na Costa Rica.',
    goalCards: [
      {
        title: 'Gestão e Digitalização',
        body: [
          'Fortalecimento de capacidades empresariais, financeiras e digitais.',
        ],
      },
      {
        title: 'Maquila / Biorrefinaria',
        body: [
          'Instalação de biorrefinaria compartilhada para o processamento de alimentos com valor agregado',
        ],
      },
      {
        title: 'Automação',
        body: [
          'Implementação de sensores para monitorar processos e otimizar a eficiência operacional',
        ],
      },
      {
        title: 'Rede de Comercialização',
        body: [
          'Criação de rede comercialização para facilitar o acesso a mercados nacionais e internacionais.',
        ],
      },
    ],
    sectionProcessTitle: 'Efeitos Multiplicadores',
    processSteps: [
      {
        title: 'Capacitação de formadores para ampliar o alcance sem recursos externos',
        body: '',
      },
      {
        title: 'Rede de comercialização que atrai novos produtores e melhora as condições de mercado',
        body: '',
      },
      {
        title: 'Documentação aberta para replicação em outras cooperativas e regiões',
        body: '',
      },
      {
        title: 'Difusão de aprendizados e resultados para atores-chave e setor público',
        body: '',
      },
    ],
    sectionImpactTitle: 'Resultados que buscamos',
    impactStats: [
      { value: '60', label: 'MIPYMEs Apoiadas' },
      { value: '80', label: 'Horas de Formação e assistência técnica' },
      { value: '1', label: 'Maquila biorrefinaria instalada' },
      { value: '10', label: 'Kits de Monitoramento e automação' },
      { value: '60', label: 'Planos de Negócio' },
    ],
    sectionMultipliersTitle: 'Efeitos Multiplicadores',
    multipliersCards: [
      'Capacitação de formadores para ampliar o alcance sem recursos externos',
      'Rede de comercialização que atrai novos produtores e melhora as condições de mercado',
      'Documentação aberta para replicação em outras cooperativas e regiões',
      'Difusão de aprendizados e resultados para atores-chave e setor público',
    ],
    sectionParticipationEyebrow: 'Como participar',
    sectionParticipationTitle: 'Escolha o próximo passo com clareza',
    sectionInscriptionTitle: 'Inscrição para participar',
    sectionInscriptionText:
      'A inscrição nos permite conhecer melhor seu contexto, entender seu interesse e coordenar o próximo passo do acompanhamento.',
    inscriptionLabel: 'Formulário de inscrição',
    inscriptionNote: 'Preencha seus dados para que a equipe possa revisar seu perfil e orientar a melhor rota de apoio.',
    sectionDiagnosisTitle: 'Diagnóstico do empreendimento',
    sectionDiagnosisText:
      'O diagnóstico ajuda a identificar prioridades, oportunidades e os pontos onde o projeto pode gerar mais valor.',
    diagnosisLabel: 'Diagnóstico inicial',
    diagnosisNote: 'Esta análise serve como base para definir a estratégia mais adequada para cada participante.',
    sectionClosingTitle: 'Pronto para dar o próximo passo?',
    sectionClosingText:
      'Desde a inscrição até o diagnóstico, o projeto busca acompanhar decisões concretas com clareza, foco e suporte real.',
    closingCtaPrimary: 'Quero participar',
    closingCtaSecondary: 'Quero o diagnóstico',
  },
  en: {
    metadataTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    metadataDescription:
      'Strengthening business, financial and digital capabilities for 60 rural agrifood MIPYMEs in Los Santos, with a focus on export and low-cost traceability.',
    heroEyebrow: 'Impulsa Mipymes',
    heroTitle: 'Impulsa Mipymes: digitaliza Los Santos',
    heroText:
      'Strengthening business, financial and digital capabilities for 60 rural agrifood MIPYMEs in Los Santos, with a focus on export and low-cost traceability.',
    heroCtaPrimary: 'Apply to the project',
    heroChips: ['Training', 'Innovation', 'Productive Efficiency', 'Digitalization', 'Commercialization'],
    sectionGoalsEyebrow: 'Objectives',
    sectionGoalsTitle: 'Objectives and Results',
    sectionGoalsText:
      'Improving the competitiveness, productivity and export readiness of participating agro-food micro, small and medium enterprises in the Los Santos region, Costa Rica.',
    goalCards: [
      {
        title: 'Management and Digitalization',
        body: [
          'Strengthening of business, financial and digital capabilities.',
        ],
      },
      {
        title: 'Maquila / Biorefinery',
        body: [
          'Installation of a shared biorefinery for processing value-added food products',
        ],
      },
      {
        title: 'Automation',
        body: [
          'Implementation of sensors to monitor processes and optimize operational efficiency',
        ],
      },
      {
        title: 'Commercialization Network',
        body: [
          'Creation of a commercialization network to facilitate access to national and international markets.',
        ],
      },
    ],
    sectionProcessTitle: 'Multiplier Effects',
    processSteps: [
      {
        title: 'Training of trainers to extend reach without external resources',
        body: '',
      },
      {
        title: 'Commercialization network that attracts new producers and improves market conditions',
        body: '',
      },
      {
        title: 'Open documentation for replication in other cooperatives and regions',
        body: '',
      },
      {
        title: 'Dissemination of lessons and results to key actors and the public sector',
        body: '',
      },
    ],
    sectionImpactTitle: 'Results we aim for',
    impactStats: [
      { value: '60', label: 'MIPYMEs supported' },
      { value: '80', label: 'hours of training and technical assistance' },
      { value: '1', label: 'installed biorefinery maquila unit' },
      { value: '10', label: 'monitoring and automation kits' },
      { value: '60', label: 'business plans' },
    ],
    sectionMultipliersTitle: 'Multiplier Effects',
    multipliersCards: [
      'Training of trainers to extend reach without external resources',
      'Commercialization network that attracts new producers and improves market conditions',
      'Open documentation for replication in other cooperatives and regions',
      'Dissemination of lessons and results to key actors and the public sector',
    ],
    sectionParticipationEyebrow: 'How to participate',
    sectionParticipationTitle: 'Choose the next step with clarity',
    sectionInscriptionTitle: 'Registration to participate',
    sectionInscriptionText:
      'The registration lets us understand your context, your interest and coordinate the next step of support.',
    inscriptionLabel: 'Registration form',
    inscriptionNote: 'Fill in your details so the team can review your profile and guide the best path forward.',
    sectionDiagnosisTitle: 'Venture diagnosis',
    sectionDiagnosisText:
      'The diagnosis helps identify priorities, opportunities and the points where the project can create the most value.',
    diagnosisLabel: 'Initial diagnosis',
    diagnosisNote: 'This analysis is the basis for defining the most suitable strategy for each participant.',
    sectionClosingTitle: 'Ready for the next step?',
    sectionClosingText:
      'From registration to diagnosis, the project seeks to accompany concrete decisions with clarity, focus and real support.',
    closingCtaPrimary: 'I want to participate',
    closingCtaSecondary: 'I want the diagnosis',
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

export default async function ProjetoPage({
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
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
    ]
  );
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    []
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <RuralCommerceHeader
        navItems={headerNavItems}
        logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')}
      />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#071F5E] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,173,173,0.18),transparent_16%),radial-gradient(circle_at_bottom_left,rgba(65,111,147,0.18),transparent_18%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-32 sm:px-8 lg:px-10 lg:pb-20 lg:pt-36">
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                {current.heroEyebrow}
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {current.heroTitle}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
                {current.heroText}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`/${locale}/projeto/inscricao`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E] transition hover:bg-[#6CC7C7]"
                >
                  {current.heroCtaPrimary}
                  <ArrowRight size={16} />
                </a>
                <a
                  href={`/${locale}/perfil`}
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver mi perfil
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/75">
                {current.heroChips.map((chip) => (
                  <span key={chip} className="rounded-full bg-white/5 px-3 py-2">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-white py-18">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-[#EEF7F7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#1D6359]">
                  {current.sectionGoalsEyebrow}
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#071F5E] sm:text-4xl">
                  {current.sectionGoalsTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#2F3336]/75">
                  {current.sectionGoalsText}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {current.goalCards.map((card) => {
                  const bodyText = Array.isArray(card.body)
                    ? card.body.join(' ')
                    : String(card.body);
                  return (
                    <article key={card.title} className="rounded-3xl border border-[#E8EEF3] bg-[#F9FBFC] p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-[#071F5E]">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{bodyText}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-24 bg-[#071F5E] py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {current.sectionProcessTitle}
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {current.processSteps.map((step, index) => {
                const icons = [Leaf, ChartNoAxesCombined, BadgeCheck, Sparkles] as const;
                const Icon = icons[index % icons.length];

                return (
                  <article
                    key={step.title}
                    className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-colors duration-200 hover:border-[#009179] hover:bg-[#009179]"
                  >
                    <div className="min-w-0 flex-1">
                      <Icon
                        className="h-8 w-8 shrink-0 text-[#4C7B5B] transition-colors duration-200 group-hover:text-white"
                        strokeWidth={1.75}
                      />
                      <h3 className="mt-4 text-lg font-semibold text-[#1E1E1E] transition-colors duration-200 group-hover:text-white">
                        {step.title}
                      </h3>
                      {step.body ? (
                        <p className="mt-1 text-sm text-[#1E1E1E]/70 transition-colors duration-200 group-hover:text-white/90">
                          {step.body}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1E1E1E]/12 bg-[#1E1E1E]/[0.04] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:border-white/35 group-hover:bg-white/15"
                      aria-hidden
                    >
                      <ArrowRight className="h-4 w-4 text-[#1E1E1E] transition-colors group-hover:text-white" />
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <div className="rounded-[32px] bg-[#071F5E] p-8 text-white sm:p-10">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  {current.sectionImpactTitle}
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{current.sectionImpactTitle}</h2>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {current.impactStats.map((stat, index) => (
                  <div key={`${stat.value}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="text-5xl font-semibold leading-none text-[#52ADAD] sm:text-6xl">{stat.value}</div>
                    <p className="mt-3 text-sm leading-6 text-white/90">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#071F5E] py-16 text-white">
          <div className="mx-auto max-w-5xl px-6 text-center sm:px-8 lg:px-10">
            <h2 className="text-3xl font-semibold tracking-tight">{current.sectionClosingTitle}</h2>
            <p className="mt-4 text-base leading-7 text-white/80">{current.sectionClosingText}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={`/${locale}/projeto/inscricao`} className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E]">
                {current.closingCtaPrimary}
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        locale={locale}
        title={String(footerProps.title || '')}
        copyright={String(footerProps.copyright || '')}
        contactTitle={String(footerProps.contactTitle || '')}
        contactAddress={String(footerProps.contactAddress || '')}
        contactPhone={String(footerProps.contactPhone || '')}
        contactEmail={String(footerProps.contactEmail || '')}
        socialLabel={String(footerProps.socialLabel || '')}
        footerLinks={footerLinks}
      />
    </div>
  );
}
