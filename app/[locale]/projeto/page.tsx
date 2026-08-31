import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { ProjectLandingReveal } from '@/components/ProjectLandingReveal';
import { ProjectSiteHeader } from '@/components/ProjectSiteHeader';
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
    metadataTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    metadataDescription:
      'Fortalecimiento de capacidades empresariales, financieras y digitales para 60 MIPYMEs agroalimentarias rurales en Los Santos, con enfoque en exportación y trazabilidad de bajo costo.',
    heroEyebrow: 'Nueva etapa',
    heroTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    heroText:
      'Fortalecimiento de capacidades empresariales, financieras y digitales para 60 MIPYMEs agroalimentarias rurales en Los Santos, con enfoque en exportación y trazabilidad de bajo costo.',
    heroNote:
      'Impulso MiPyMEs conecta capacidades, herramientas y mercados para transformar desafíos estructurales en oportunidades sostenibles.',
    heroCtaPrimary: 'Inscribirme al proyecto',
    heroChips: ['Formación', 'Innovación', 'Eficiencia Productiva', 'Digitalización', 'Comercialización'],
    sectionGoalsEyebrow: 'Objetivos',
    sectionGoalsTitle: 'Objetivos',
    sectionGoalsText:
      'Mejora de la competitividad, la productividad y la preparación para la exportación de las micro, pequeñas y medianas empresas agroalimentarias participantes en la región de Los Santos, en Costa Rica.',
    sectionResultsTitle: 'Pilares de acción',
    resultsCards: [
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
    sectionProcessEyebrow: 'Multiplicadores',
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
    sectionImpactEyebrow: 'Resultados',
    sectionImpactTitle: 'Resultados que buscamos',
    impactStats: [
      { value: '60', label: 'MIPYMEs Apoyadas' },
      { value: '80', label: 'Horas Formación y asistencia técnica' },
      { value: '1', label: 'Maquila biorrefinaría Instalada' },
      { value: '10', label: 'Kits de Monitoreo y automación' },
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
    metadataTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    metadataDescription:
      'Fortalecimento de capacidades empresariais, financeiras e digitais para 60 MIPYMEs agroalimentares rurais em Los Santos, com foco em exportação e rastreabilidade de baixo custo.',
    heroEyebrow: 'Nova etapa',
    heroTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    heroText:
      'Fortalecimento de capacidades empresariais, financeiras e digitais para 60 MIPYMEs agroalimentares rurais em Los Santos, com foco em exportação e rastreabilidade de baixo custo.',
    heroNote:
      'Impulso MiPyMEs conecta capacidades, ferramentas e mercados para transformar desafios estruturais em oportunidades sustentáveis.',
    heroCtaPrimary: 'Me inscrever no projeto',
    heroChips: ['Formação', 'Inovação', 'Eficiência Produtiva', 'Digitalização', 'Comercialização'],
    sectionGoalsEyebrow: 'Objetivos',
    sectionGoalsTitle: 'Objetivos',
    sectionGoalsText:
      'Melhoria da competitividade, produtividade e preparação para a exportação das micro, pequenas e médias empresas agroalimentares participantes na região de Los Santos, na Costa Rica.',
    sectionResultsTitle: 'Pilares de ação',
    resultsCards: [
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
    sectionProcessEyebrow: 'Multiplicadores',
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
    sectionImpactEyebrow: 'Resultados',
    sectionImpactTitle: 'Resultados que buscamos',
    impactStats: [
      { value: '60', label: 'MIPYMEs Apoiadas' },
      { value: '80', label: 'Horas de Formação e assistência técnica' },
      { value: '1', label: 'Maquila biorrefinaria instalada' },
      { value: '10', label: 'Kits de Monitoramento e automação' },
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
    metadataTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    metadataDescription:
      'Strengthening business, financial and digital capabilities for 60 rural agrifood MIPYMEs in Los Santos, with a focus on export and low-cost traceability.',
    heroEyebrow: 'New stage',
    heroTitle: 'Impulso MiPyMEs: digitaliza Los Santos',
    heroText:
      'Strengthening business, financial and digital capabilities for 60 rural agrifood MIPYMEs in Los Santos, with a focus on export and low-cost traceability.',
    heroNote:
      'Impulso MiPyMEs connects capabilities, tools and markets to turn structural challenges into sustainable opportunities.',
    heroCtaPrimary: 'Apply to the project',
    heroChips: ['Training', 'Innovation', 'Productive Efficiency', 'Digitalization', 'Commercialization'],
    sectionGoalsEyebrow: 'Objectives',
    sectionGoalsTitle: 'Objectives',
    sectionGoalsText:
      'Improving the competitiveness, productivity and export readiness of participating agro-food micro, small and medium enterprises in the Los Santos region, Costa Rica.',
    sectionResultsTitle: 'Pillars of action',
    resultsCards: [
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
    sectionProcessEyebrow: 'Multipliers',
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
    sectionImpactEyebrow: 'Results',
    sectionImpactTitle: 'Results we aim for',
    impactStats: [
      { value: '60', label: 'MIPYMEs supported' },
      { value: '80', label: 'hours of training and technical assistance' },
      { value: '1', label: 'installed biorefinery maquila unit' },
      { value: '10', label: 'monitoring and automation kits' },
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

const resultsCardIcons = [
  <svg key="results-icon-0" viewBox="0 0 48 48" aria-hidden>
    <rect x="10" y="12" width="28" height="20" rx="5" />
    <path d="M16 38h16M20 32v6M28 32v6" />
  </svg>,
  <svg key="results-icon-1" viewBox="0 0 48 48" aria-hidden>
    <path d="M12 32V16M24 36V12M36 28V20" />
    <path d="M9 32h6M21 36h6M33 28h6" />
    <path d="M12 16c6 10 18 10 24 4" />
  </svg>,
  <svg key="results-icon-2" viewBox="0 0 48 48" aria-hidden>
    <path d="M8 17l16-7 16 7-16 7-16-7Z" />
    <path d="M15 22v8c5 5 13 5 18 0v-8" />
    <path d="M40 17v13" />
  </svg>,
  <svg key="results-icon-3" viewBox="0 0 48 48" aria-hidden>
    <path d="M10 34c10 0 12-20 28-20" />
    <path d="M30 14h8v8" />
    <path d="M12 22h8M12 30h6M12 38h20" />
  </svg>,
] as const;

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
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    []
  );

  return (
    <div className="projeto-landing min-h-screen bg-[#f2f2f2]">
      <main className="flex-1">
        <section className="projeto-hero" id="inicio">
          <ProjectSiteHeader locale={locale} />
          <div className="projeto-hero-pattern" aria-hidden />
          <div className="projeto-hero-shape-teal" aria-hidden />
          <div className="projeto-hero-shape-blue" aria-hidden />

          <div className="projeto-container projeto-hero-content">
            <ProjectLandingReveal className="projeto-hero-copy">
              <span className="projeto-eyebrow">{current.heroEyebrow}</span>
              <h1>{current.heroTitle}</h1>
              <p>{current.heroText}</p>
              <a href={`/${locale}/projeto/inscricao`} className="projeto-hero-btn">
                {current.heroCtaPrimary}
                <span className="projeto-hero-btn-icon">
                  <ArrowRight size={16} />
                </span>
              </a>
            </ProjectLandingReveal>

            <ProjectLandingReveal className="projeto-hero-meta" delayMs={90}>
              <p className="projeto-hero-note">{current.heroNote}</p>
            </ProjectLandingReveal>
          </div>
        </section>

        <section className="projeto-objectives" id="objetivos">
          <div className="projeto-container projeto-split">
            <ProjectLandingReveal className="projeto-text-stack" delayMs={45}>
              <span className="projeto-eyebrow">{current.sectionGoalsEyebrow}</span>
              <h2>{current.sectionGoalsTitle}</h2>
              <p>{current.sectionGoalsText}</p>
            </ProjectLandingReveal>

            <ProjectLandingReveal delayMs={135}>
              <div className="projeto-brand-orbit" aria-hidden>
                <img className="projeto-orbit-logo" src="/images/icone-azul.png" alt="" />
                <span className="projeto-orbit-dot projeto-orbit-dot-1" />
                <span className="projeto-orbit-dot projeto-orbit-dot-2" />
                <span className="projeto-orbit-dot projeto-orbit-dot-3" />
              </div>
            </ProjectLandingReveal>
          </div>
        </section>

        <section className="projeto-ecosystem" id="resultados">
          <div className="projeto-container">
            <ProjectLandingReveal className="projeto-text-stack">
              <h2>{current.sectionResultsTitle}</h2>
            </ProjectLandingReveal>

            <div className="projeto-ecosystem-cards">
              {current.resultsCards.map((card, index) => (
                <ProjectLandingReveal key={card.title} delayMs={index * 45}>
                  <article className="projeto-ecosystem-card">
                    <div>
                      <div className="projeto-ecosystem-card-icon">{resultsCardIcons[index]}</div>
                      <h3>{card.title}</h3>
                      <p>{card.body.join(' ')}</p>
                    </div>
                  </article>
                </ProjectLandingReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="projeto-impact" id="impacto">
          <div className="projeto-container">
            <ProjectLandingReveal className="projeto-impact-head">
              <div>
                <span className="projeto-eyebrow projeto-impact-eyebrow">{current.sectionImpactEyebrow}</span>
                <h2>{current.sectionImpactTitle}</h2>
              </div>
            </ProjectLandingReveal>

            <div className="projeto-impact-metrics">
              {current.impactStats.map((stat, index) => (
                <ProjectLandingReveal key={`${stat.value}-${stat.label}`} delayMs={index * 45} className="projeto-impact-metric-wrap">
                  <div className="projeto-impact-metric">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </ProjectLandingReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="projeto-human" id="multiplicadores">
          <div className="projeto-human-grid">
            <ProjectLandingReveal className="projeto-human-photo-wrap">
              <div
                className="projeto-human-photo"
                role="img"
                aria-label="Productores rurales y acompañamiento técnico en el territorio"
              />
            </ProjectLandingReveal>

            <ProjectLandingReveal className="projeto-human-copy" delayMs={90}>
              <span className="projeto-eyebrow">{current.sectionProcessEyebrow}</span>
              <h2>{current.sectionProcessTitle}</h2>
              <ul className="projeto-human-list">
                {current.processSteps.map((step) => (
                  <li key={step.title}>{step.title}</li>
                ))}
              </ul>
            </ProjectLandingReveal>
          </div>
        </section>

        <section className="bg-[#071F5E] py-16 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-8 lg:px-10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{current.sectionClosingTitle}</h2>
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
