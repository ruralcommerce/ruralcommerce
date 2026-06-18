import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import Image from 'next/image';
import { Building2, Cpu, GraduationCap, HandCoins } from 'lucide-react';
import { getBlockProps, getFirstFreeTextContent, getManagedPageLayout, getSectionProps, LayoutSearchParams, parseJsonArray } from '@/lib/page-layout-runtime';
import type { Metadata } from 'next';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const aliadosCopy = {
  es: {
    metadataTitle: 'Aliados e Inversores — Rural Commerce',
    metadataDescription: 'Alianzas estratégicas para impacto sostenible y crecimiento.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '#contacto' },
    ],
    heroTitle: 'Inversión estratégica en la nueva economía rural.',
    heroSubtitle:
      'Somos el socio operativo que transforma el potencial del campo en activos de alto rendimiento. Conectamos capital e instituciones con modelos de negocio rurales validados, escalables y con trazabilidad de impacto real.',
    heroCta: 'Contactar',
    pillarsTitle: 'Pilares de intervención estratégica y generación de valor',
    features: [
      {
        title: 'Inteligencia Operativa',
        body: 'Implementamos arquitectura técnica para operar con estándares internacionales y datos en tiempo real.',
      },
      {
        title: 'Activos de Alto Rendimiento',
        body: 'Transformamos capital en infraestructura productiva rentable mediante tecnología, procesos y equipamiento.',
      },
      {
        title: 'Estructuración de Capital',
        body: 'Desarrollamos proyectos para captación de fondos y conexión con mercados de alto valor y trazabilidad total.',
      },
      {
        title: 'Escalabilidad del Capital Humano',
        body: 'Garantizamos sostenibilidad de la inversión con formación continua y adopción operativa de innovación.',
      },
    ],
    servicesTag: 'Servicios B2B',
    servicesTitle: 'Soluciones a medida',
    solutions: [
      {
        title: 'Desarrollo de Proveedores',
        body: 'Programas de capacitación y certificación para una cadena de suministro confiable y sostenible.',
      },
      {
        title: 'Proyectos de Impacto Social y Ambiental',
        body: 'Iniciativas enfocadas en generación de ingresos, equidad y preservación de recursos naturales.',
      },
      {
        title: 'Licenciamiento y White Label',
        body: 'Adopta nuestra metodología y tecnología bajo tu marca para ampliar tu cartera de soluciones.',
      },
      {
        title: 'Monitoreo y Reportes ESG',
        body: 'Herramientas de consultoría para medir impacto con datos reales y auditables.',
      },
    ],
    workflowTitle: 'Modelo de trabajo',
    wfDiagTitle1a: 'Diagnóstico',
    wfDiagTitle1b: 'e Inteligencia',
    wfDiagDesc1a: 'Identificamos brechas de',
    wfDiagDesc1b: 'eficiencia y proyectamos la',
    wfDiagDesc1c: 'rentabilidad del activo.',
    wfDiagTitle2a: 'Tecnología',
    wfDiagTitle2b: 'y Despliegue',
    wfDiagDesc2a: 'Digitalizamos la operación',
    wfDiagDesc2b: 'con IA para asegurar',
    wfDiagDesc2c: 'control total del riesgo.',
    wfDiagTitle3a: 'Formación',
    wfDiagTitle3b: 'y Autonomía',
    wfDiagDesc3a: 'Capacitación en territorio y',
    wfDiagDesc3b: 'puesta en marcha tecnológica.',
    wfDiagTitle4a: 'Mercado',
    wfDiagTitle4b: 'y Retorno',
    wfDiagDesc4a: 'Conectamos con canales premium',
    wfDiagDesc4b: 'para maximizar ROI e',
    wfDiagDesc4c: 'impacto real.',
    mobileWorkflow: [
      { title: 'Diagnóstico', desc: 'Alineación de objetivos estratégicos y necesidades.' },
      { title: 'Definición del Modelo', desc: 'Elección entre licenciamiento, co-desarrollo o marca blanca.' },
      { title: 'Implementación', desc: 'Capacitación en territorio y puesta en marcha tecnológica.' },
      { title: 'Monitoreo', desc: 'Evaluación continua y entrega de reportes de impacto.' },
    ],
    ctaTitle: '¿Listo para crecer juntos?',
    ctaBody: 'Conversemos sobre cómo una alianza con Rural Commerce puede transformar impacto y resultados.',
    ctaButton: 'Hablar con un asesor',
  },
  'pt-BR': {
    metadataTitle: 'Aliados e Investidores — Rural Commerce',
    metadataDescription: 'Parcerias estratégicas para impacto sustentável e crescimento.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Aliados e Investidores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '#contacto' },
    ],
    heroTitle: 'Investimento estratégico na nova economia rural.',
    heroSubtitle:
      'Somos o parceiro operacional que transforma o potencial do campo em ativos de alto desempenho. Conectamos capital e instituições a modelos de negócio rurais validados, escaláveis e com rastreabilidade de impacto real.',
    heroCta: 'Entrar em contato',
    pillarsTitle: 'Pilares de intervenção estratégica e geração de valor',
    features: [
      {
        title: 'Inteligência Operacional',
        body: 'Implementamos arquitetura técnica para operar com padrões internacionais e dados em tempo real.',
      },
      {
        title: 'Ativos de Alto Desempenho',
        body: 'Transformamos capital em infraestrutura produtiva rentável por meio de tecnologia, processos e equipamentos.',
      },
      {
        title: 'Estruturação de Capital',
        body: 'Desenvolvemos projetos para captação de recursos e conexão com mercados de alto valor e rastreabilidade total.',
      },
      {
        title: 'Escalabilidade do Capital Humano',
        body: 'Garantimos a sustentabilidade do investimento com formação contínua e adoção operacional da inovação.',
      },
    ],
    servicesTag: 'Serviços B2B',
    servicesTitle: 'Soluções sob medida',
    solutions: [
      {
        title: 'Desenvolvimento de Fornecedores',
        body: 'Programas de capacitação e certificação para uma cadeia de suprimentos confiável e sustentável.',
      },
      {
        title: 'Projetos de Impacto Social e Ambiental',
        body: 'Iniciativas focadas em geração de renda, equidade e preservação de recursos naturais.',
      },
      {
        title: 'Licenciamento e White Label',
        body: 'Adote nossa metodologia e tecnologia com sua marca para ampliar seu portfólio de soluções.',
      },
      {
        title: 'Monitoramento e Relatórios ESG',
        body: 'Ferramentas de consultoria para medir impacto com dados reais e auditáveis.',
      },
    ],
    workflowTitle: 'Modelo de trabalho',
    wfDiagTitle1a: 'Diagnóstico',
    wfDiagTitle1b: 'e Inteligência',
    wfDiagDesc1a: 'Identificamos lacunas de',
    wfDiagDesc1b: 'eficiência e projetamos a',
    wfDiagDesc1c: 'rentabilidade do ativo.',
    wfDiagTitle2a: 'Tecnologia',
    wfDiagTitle2b: 'e Implantação',
    wfDiagDesc2a: 'Digitalizamos a operação',
    wfDiagDesc2b: 'com IA para garantir',
    wfDiagDesc2c: 'controle total de risco.',
    wfDiagTitle3a: 'Formação',
    wfDiagTitle3b: 'e Autonomia',
    wfDiagDesc3a: 'Capacitação em campo e',
    wfDiagDesc3b: 'implantação tecnológica.',
    wfDiagTitle4a: 'Mercado',
    wfDiagTitle4b: 'e Retorno',
    wfDiagDesc4a: 'Conectamos com canais premium',
    wfDiagDesc4b: 'para maximizar ROI e',
    wfDiagDesc4c: 'impacto real.',
    mobileWorkflow: [
      { title: 'Diagnóstico', desc: 'Alinhamento de objetivos estratégicos e necessidades.' },
      { title: 'Definição do Modelo', desc: 'Escolha entre licenciamento, codesenvolvimento ou marca branca.' },
      { title: 'Implementação', desc: 'Capacitação em campo e entrada em operação tecnológica.' },
      { title: 'Monitoramento', desc: 'Avaliação contínua e entrega de relatórios de impacto.' },
    ],
    ctaTitle: 'Pronto para crescer em parceria?',
    ctaBody: 'Vamos conversar sobre como uma parceria com a Rural Commerce pode transformar impacto e resultados.',
    ctaButton: 'Falar com um consultor',
  },
  en: {
    metadataTitle: 'Partners & Investors — Rural Commerce',
    metadataDescription: 'Strategic partnerships for sustainable impact and growth.',
    navItems: [
      { label: 'About', href: '/sobre' },
      { label: 'Solutions', href: '/solucoes' },
      { label: 'Partners & Investors', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '#contacto' },
    ],
    heroTitle: 'Strategic investment in the new rural economy.',
    heroSubtitle:
      'We are the operating partner that transforms rural potential into high-performance assets. We connect capital and institutions with validated, scalable business models and full impact traceability.',
    heroCta: 'Contact us',
    pillarsTitle: 'Strategic intervention pillars and value generation',
    features: [
      {
        title: 'Operational Intelligence',
        body: 'We deploy technical architecture to ensure international-grade operation and real-time decision data.',
      },
      {
        title: 'High-Performance Assets',
        body: 'We turn capital into profitable production infrastructure through technology, process, and equipment.',
      },
      {
        title: 'Capital Structuring',
        body: 'We design funding projects and connect production to high-value markets with full traceability.',
      },
      {
        title: 'Human Capital Scalability',
        body: 'We sustain investments through continuous training and practical innovation adoption.',
      },
    ],
    servicesTag: 'B2B Services',
    servicesTitle: 'Tailored solutions',
    solutions: [
      {
        title: 'Supplier Development',
        body: 'Training and certification programs to secure a reliable and sustainable supply chain.',
      },
      {
        title: 'Social and Environmental Impact Projects',
        body: 'Initiatives focused on income generation, equity, and natural resource preservation.',
      },
      {
        title: 'Licensing and White Label',
        body: 'Adopt our methodology and technology under your brand to expand your solutions portfolio.',
      },
      {
        title: 'ESG Monitoring and Reporting',
        body: 'Consulting tools to measure impact with real and auditable data.',
      },
    ],
    workflowTitle: 'Operating model',
    wfDiagTitle1a: 'Diagnosis',
    wfDiagTitle1b: '& Intelligence',
    wfDiagDesc1a: 'We identify efficiency',
    wfDiagDesc1b: 'gaps and project asset',
    wfDiagDesc1c: 'profitability.',
    wfDiagTitle2a: 'Technology',
    wfDiagTitle2b: '& Deployment',
    wfDiagDesc2a: 'We digitize operations',
    wfDiagDesc2b: 'with AI to ensure',
    wfDiagDesc2c: 'full risk control.',
    wfDiagTitle3a: 'Training',
    wfDiagTitle3b: '& Autonomy',
    wfDiagDesc3a: 'Field training and',
    wfDiagDesc3b: 'technology rollout.',
    wfDiagTitle4a: 'Market',
    wfDiagTitle4b: '& Return',
    wfDiagDesc4a: 'We connect premium channels',
    wfDiagDesc4b: 'to maximize ROI and',
    wfDiagDesc4c: 'real impact.',
    mobileWorkflow: [
      { title: 'Diagnosis', desc: 'Alignment of strategic goals and needs.' },
      { title: 'Model Definition', desc: 'Choose between licensing, co-development, or white label.' },
      { title: 'Implementation', desc: 'Field enablement and technology go-live.' },
      { title: 'Monitoring', desc: 'Continuous evaluation and impact reporting delivery.' },
    ],
    ctaTitle: 'Ready to grow together?',
    ctaBody: 'Let us discuss how a Rural Commerce partnership can transform impact and results.',
    ctaButton: 'Talk to an advisor',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const copy = aliadosCopy[getLocaleKey(params.locale)];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

const HERO_BG = '/images/solucoes/solucoes-hero.png';

const features = [
  {
    key: 'operational',
    icon: Cpu,
    iconWrapper: 'bg-[#DBE8EF] text-[#3C6B80]',
  },
  {
    key: 'assets',
    icon: Building2,
    iconWrapper: 'bg-[#DDECD4] text-[#74A954]',
  },
  {
    key: 'capital',
    icon: HandCoins,
    iconWrapper: 'bg-[#E6DCF0] text-[#6D5C9A]',
  },
  {
    key: 'human',
    icon: GraduationCap,
    iconWrapper: 'bg-[#FDE8D8] text-[#B8622A]',
  },
] as const;

const solutions = [
  {
    key: 'supplier',
  },
  {
    key: 'impact',
  },
  {
    key: 'licensing',
  },
  {
    key: 'esg',
  },
] as const;

const workflowSteps = [
  {
    label: 'Diagnóstico',
    desc: 'Evaluamos la oportunidad, los actores clave y el potencial de impacto del proyecto.',
    position: 'left',
  },
  {
    label: 'Implementación',
    desc: 'Ejecutamos el plan operativo con equipos especializados y tecnología de precisión.',
    position: 'right',
  },
  {
    label: 'Mantener',
    desc: 'Monitoreamos indicadores, ajustamos la estrategia y reportamos resultados de forma continua.',
    position: 'bottom',
  },
] as const;

const examples = [
  {
    quote: 'Logramos reducir en un 40% las pérdidas post-cosecha en proyectos acompañados, generando nuevos flujos de ingresos para productores y aliados de la cadena.',
    source: 'Resultado referencial - Red RC',
  },
  {
    quote: 'Productores en nuestra red alcanzaron estándares de certificación de calidad internacionales en menos de 6 meses, abriendo acceso a mercados premium.',
    source: 'Resultado referencial - Red RC',
  },
  {
    quote: 'Equipos que operaron el programa de Implementación Rápida reportaron mejoras de eficiencia operativa superiores al 30% en el primer trimestre.',
    source: 'Resultado referencial - Red RC',
  },
] as const;

export default async function AliadosPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const copy = aliadosCopy[locale];
  const layout = await getManagedPageLayout('aliados', searchParams, params.locale);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const heroProps = getSectionProps(layout, 'hero-section');
  const freeTextContent = getFirstFreeTextContent(layout);
  const heroBackground = String(heroProps.bgImage || HERO_BG);
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(headerProps.navItemsJson, copy.navItems as unknown as { label: string; href: string }[]);
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(footerProps.footerLinksJson, []);
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main>
        {/* Bloco 1: Hero */}
        <section id="hero" data-editor-section="hero-section" className="relative flex min-h-[100dvh] flex-col">
          <div
            className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071F5E]/60 via-[#071F5E]/50 to-black/40" />

          <div className="relative flex flex-1 flex-col items-start justify-center px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:ml-[10%] md:-mt-[3%] md:px-12">
            <h1
              className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-[56px] md:leading-[63px] md:tracking-[-2px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.title || copy.heroTitle}
            </h1>
            <p
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/95 sm:text-lg md:text-[19px] md:leading-[30px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.subtitle || copy.heroSubtitle}
            </p>
            <div className="mt-7">
              <a
                href={heroProps.ctaUrl || 'mailto:contacto@ruralcommerce.com'}
                className="inline-flex items-center justify-center rounded-xl bg-[#009179] px-7 py-3 text-sm font-bold leading-snug tracking-tight text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b] sm:text-base md:px-8 md:py-3"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                {heroProps.ctaText || copy.heroCta}
              </a>
            </div>
          </div>
        </section>

        {freeTextContent ? (
          <section data-editor-section="free-text" className="bg-[#F4F8FB] py-8 sm:py-10">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="rounded-xl border border-[#071F5E]/10 bg-white p-6 text-sm leading-relaxed text-[#1E1E1E] sm:text-base">
                {freeTextContent}
              </div>
            </div>
          </section>
        ) : null}

        {/* Bloco 2: Transformamos el campo */}
        <section data-editor-section="system-section" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2
              className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight tracking-[-0.5px] text-[#20242E] sm:text-4xl"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {copy.pillarsTitle}
            </h2>

            <div className="mx-auto mt-14 grid max-w-5xl gap-x-12 gap-y-10 md:grid-cols-2">
              {features.map((item, index) => {
                const Icon = item.icon;
                const feature = copy.features[index];
                return (
                  <article key={item.key} className="flex items-start gap-5">
                    <span
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${item.iconWrapper}`}
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3
                        className="text-xl font-semibold leading-tight text-[#20242E]"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-[#3D4352]">{feature.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bloco 3: Soluciones a medida */}
        <section data-editor-section="solutions-section" className="bg-[#F6F7F8] py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-[390px_minmax(0,1fr)] items-start gap-10 px-4 sm:px-6 md:gap-12 lg:gap-16">
            <div className="relative h-[430px] w-[390px] shrink-0">
              <div className="relative h-[320px] w-[305px] origin-top-left scale-[1.22]">
              <div className="absolute left-[112px] top-[98px] h-[145px] w-[158px] rounded-[10px] bg-[#DCEBE6]" />

              <div className="absolute left-[76px] top-[98px] grid grid-cols-2 gap-x-[8px] gap-y-[7px]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="h-[6px] w-[6px] rounded-full border border-[#1E2A73]" />
                ))}
              </div>

              <div className="absolute left-[31px] top-[50px] h-[44px] w-[46px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/hero-1.png" alt="Tile decorativo" fill className="object-cover object-[20%_45%]" sizes="46px" />
              </div>

              <div className="absolute left-[138px] top-[0px] h-[45px] w-[51px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-pic2.png" alt="Tile decorativo" fill className="object-cover object-[56%_8%] scale-[1.2]" sizes="51px" />
              </div>

              <div className="absolute left-[88px] top-[64px] h-[188px] w-[130px] overflow-hidden rounded-[14px] shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
                <Image src="/images/home/home-pic2.png" alt="Imagem principal do mosaico" fill className="object-cover object-[63%_50%] scale-[1.97]" sizes="130px" />
              </div>

              <div className="absolute left-[219px] top-[92px] h-[102px] w-[26px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-pic2.png" alt="Tile lateral" fill className="object-cover object-[92%_38%] scale-[1.75]" sizes="26px" />
              </div>

              <div className="absolute left-[226px] top-[50px] h-[44px] w-[57px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-ils3.png" alt="Tile decorativo" fill className="object-cover object-center" sizes="57px" />
              </div>

              <div className="absolute left-[233px] top-[141px] h-[42px] w-[43px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-ils2.png" alt="Tile decorativo" fill className="object-cover object-center" sizes="43px" />
              </div>

              <div className="absolute left-[23px] top-[178px] h-[56px] w-[58px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-pic2.png" alt="Tile decorativo" fill className="object-cover object-[18%_66%] scale-[1.35]" sizes="58px" />
              </div>

              <div className="absolute left-[122px] top-[246px] h-[48px] w-[48px] overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
                <Image src="/images/home/home-pic2.png" alt="Tile decorativo" fill className="object-cover object-[44%_98%] scale-[1.8]" sizes="48px" />
              </div>
              </div>
            </div>

            <div className="pt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#009179] sm:text-xs">
                {copy.servicesTag}
              </p>
              <h2
                className="mt-3 text-3xl font-bold leading-tight tracking-[-0.5px] text-[#20242E] sm:text-4xl"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                {copy.servicesTitle}
              </h2>

              <div className="mt-8 space-y-5">
                {solutions.map((s, index) => {
                  const solution = copy.solutions[index];
                  return (
                  <article key={s.key}>
                    <h3 className="text-lg font-bold leading-snug text-[#1E1E1E]">{solution.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#3D4352]">{solution.body}</p>
                  </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 4: Modelo de trabajo */}
        <section data-editor-section="stats-section" className="bg-[#00071B] py-8 text-white sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2
              className="text-center text-3xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {copy.workflowTitle}
            </h2>

            {/* Desktop: diagrama limpo sem sobreposicao */}
            <div className="relative mx-auto mt-4 hidden h-[240px] max-w-5xl md:block">
              <div className="absolute left-1/2 top-0 h-[240px] w-[1308px] -translate-x-1/2 origin-top scale-[1.15]">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 980 360" fill="none" aria-hidden>
                  <defs>
                    <marker id="workflow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 9 3, 0 6" fill="#FFFFFF" />
                    </marker>
                    <pattern id="workflow-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.8" fill="#0B153F" />
                    </pattern>
                  </defs>

                  <g transform="translate(0 -20)">

                  <path d="M56 188 L86 188" stroke="#FFFFFF" strokeWidth="2" markerEnd="url(#workflow-arrow)" />
                  <path
                    d="M86 188 C132 188 140 132 200 132 C248 132 250 234 308 234 C366 234 366 114 428 114 C486 114 486 234 546 234 C606 234 606 132 670 132 C724 132 724 226 790 226 C836 226 840 146 884 146 C902 146 914 156 924 166"
                    stroke="#D8E7FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M924 166 L948 182" stroke="#FFFFFF" strokeWidth="2" markerEnd="url(#workflow-arrow)" />

                  <rect x="620" y="86" width="78" height="52" fill="url(#workflow-dots)" />

                  <text x="154" y="160" fill="#59D2BF" fontSize="13" fontWeight="600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="154" dy="0">{copy.wfDiagTitle1a}</tspan>
                    <tspan x="154" dy="16">{copy.wfDiagTitle1b}</tspan>
                  </text>

                  <text x="200" y="190" fill="#E6EEFF" fontSize="9" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="190" dy="0">{copy.wfDiagDesc1a}</tspan>
                    <tspan x="190" dy="12">{copy.wfDiagDesc1b}</tspan>
                    <tspan x="190" dy="12">{copy.wfDiagDesc1c}</tspan>
                  </text>

                  <text x="428" y="150" fill="#59D2BF" fontSize="13" fontWeight="600" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="428" dy="0">{copy.wfDiagTitle2a}</tspan>
                    <tspan x="428" dy="16">{copy.wfDiagTitle2b}</tspan>
                  </text>
                  <text x="428" y="180" fill="#E6EEFF" fontSize="8.5" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="428" dy="0">{copy.wfDiagDesc2a}</tspan>
                    <tspan x="428" dy="12">{copy.wfDiagDesc2b}</tspan>
                    <tspan x="428" dy="12">{copy.wfDiagDesc2c}</tspan>
                  </text>

                  <text x="630" y="160" fill="#59D2BF" fontSize="13" fontWeight="600" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="635" dy="0">{copy.wfDiagTitle3a}</tspan>
                    <tspan x="630" dy="16">{copy.wfDiagTitle3b}</tspan>
                  </text>

                  <text x="670" y="192" fill="#E6EEFF" fontSize="8.5" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="670" dy="0">{copy.wfDiagDesc3a}</tspan>
                    <tspan x="670" dy="12">{copy.wfDiagDesc3b}</tspan>
                  </text>

                  <text x="884" y="180" fill="#59D2BF" fontSize="13" fontWeight="600" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="888" dy="0">{copy.wfDiagTitle4a}</tspan>
                    <tspan x="884" dy="16">{copy.wfDiagTitle4b}</tspan>
                  </text>
                  <text x="884" y="210" fill="#E6EEFF" fontSize="8.5" textAnchor="middle" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    <tspan x="884" dy="0">{copy.wfDiagDesc4a}</tspan>
                    <tspan x="884" dy="12">{copy.wfDiagDesc4b}</tspan>
                    <tspan x="884" dy="12">{copy.wfDiagDesc4c}</tspan>
                  </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Mobile: versao empilhada */}
            <div className="mx-auto mt-12 max-w-2xl space-y-4 md:hidden">
              {copy.mobileWorkflow.map((step) => (
                <article key={step.title} className="rounded-xl border border-white/25 bg-[#223184] p-4">
                  <h3 className="text-base font-semibold text-[#3CC9B3]">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#E6EEFF]">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 6: CTA */}
        <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#071F5E] py-16 text-center text-white sm:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071F5E] via-[#0a2a70] to-[#00071B]" aria-hidden />
          <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
            <h2
              className="text-3xl font-bold leading-tight text-white sm:text-4xl"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
              {copy.ctaBody}
            </p>
            <a
              href="mailto:contacto@ruralcommerce.com"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#009179] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#007d6b]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {copy.ctaButton}
            </a>
          </div>
        </section>
      </main>

      <RuralCommerceFooter
        locale={locale}
        title={String(footerProps.title || 'Rural Commerce')}
        copyright={String(footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`)}
        contactTitle={String(footerProps.contactTitle || 'Contacto')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay - dirección comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 - - - - -')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociales')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
      />
    </div>
  );
}

