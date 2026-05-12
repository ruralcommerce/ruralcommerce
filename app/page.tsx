import Image from 'next/image';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  Tablet,
  Tractor,
  Users,
  Wind,
} from 'lucide-react';
import { PartnersLogosCarousel } from '@/components/PartnersLogosCarousel';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { StatsCarousel } from '@/components/StatsCarousel';
import { BlockData, PageSchema } from '@/lib/editor-types';
import { getBlockProps, parseJsonArray } from '@/lib/page-layout-runtime';

const ecosystemPillars = [
  {
    title: 'Hardware de Precisión',
    body: 'Equipos modulares orientados a optimizar procesos, reducir costos y agregar valor a la producción.',
  },
  {
    title: 'Software de Inteligencia y Gestión',
    body: 'Herramientas que centralizan la gestión del negocio y el monitoreo de la producción, entregando indicadores y seguridad para la toma de decisiones.',
  },
  {
    title: 'Gestión de Rescate y Valorización',
    body: 'Procesos comerciales que transforman mermas en productos vendibles con vida útil extendida, evitando emisiones por descarte.',
  },
  {
    title: 'Metodología de Aceleración',
    body: 'Marco práctico para estandarizar calidad, estructurar márgenes y abrir canales comerciales.',
  },
];

const segments = [
  {
    title: 'Productores',
    subtitle: 'Escala tu negocio',
    iconKey: 'tractor',
    icon: Tractor,
    href: '/solucoes',
  },
  {
    title: 'Empresas ESG / cadena de suministro',
    subtitle: 'Eficiencia y trazabilidad',
    iconKey: 'leaf',
    icon: Leaf,
    href: '/aliados',
  },
  {
    title: 'Gobiernos',
    subtitle: 'Desarrollo territorial',
    iconKey: 'building2',
    icon: Building2,
    href: '/aliados',
  },
] as const;

const segmentIconMap = {
  tractor: Tractor,
  leaf: Leaf,
  building2: Building2,
  users: Users,
} as const;

const solutions = [
  {
    title: 'Diagnóstico de Eficiencia',
    body: 'Descubra dónde está perdiendo dinero su negocio.',
    cta: 'Saber más',
    variant: 'navy' as const,
  },
  {
    title: 'Curso de Procesamiento y Gestión',
    body: 'Capacitación técnica para el estándar de retail (comercio minorista).',
    cta: 'Saber más',
    variant: 'sage' as const,
  },
  {
    title: 'Kit de Implementación Rápida',
    body: 'Tecnología y metodología para comenzar a generar ganancias hoy mismo.',
    cta: 'Saber más',
    variant: 'royal' as const,
  },
];

const HERO_BG = '/images/home/hero-1.png';

const ECOSYSTEM_IMG = '/images/home/home-pic2.png?v=20260510';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');
const DEFAULT_SECTION_ORDER = [
  'hero-section',
  'system-section',
  'segments-section',
  'solutions-section',
  'stats-section',
  'partners-section',
];

type HomeSearchParams = {
  preview?: string;
  key?: string;
};

async function getHomepageLayout(searchParams?: HomeSearchParams): Promise<PageSchema | null> {
  try {
    const content = await fs.readFile(path.join(LAYOUTS_DIR, 'homepage.json'), 'utf-8');
    const layout = JSON.parse(content) as PageSchema;

    const previewEnabled = searchParams?.preview === 'draft';
    const previewKey = searchParams?.key;
    const expectedPreviewKey = process.env.EDITOR_PREVIEW_KEY || 'rural-preview';

    if (previewEnabled && previewKey === expectedPreviewKey) {
      return layout;
    }

    if (layout.status !== 'published') return null;
    return layout;
  } catch {
    return null;
  }
}

function getSectionProps(layout: PageSchema | null, sectionType: string): Record<string, any> {
  if (!layout) return {};
  const block = layout.blocks.find((item) => item.type === sectionType) as BlockData | undefined;
  return block?.props ?? {};
}

function SolutionIllustration({ variant }: { variant: 'navy' | 'sage' | 'royal' }) {
  const srcMap = {
    navy: '/images/home/home-ils1.png',
    sage: '/images/home/home-ils2.png',
    royal: '/images/home/home-ils3.png',
  } as const;

  return (
    <div className="flex h-full min-h-[168px] items-center justify-center overflow-hidden px-6 py-6">
      <div className="relative h-[112px] w-[220px] sm:h-[124px] sm:w-[240px] md:h-[132px] md:w-[260px]">
        <Image
          src={srcMap[variant]}
          alt="Ilustração do card de soluções"
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 100vw, 350px"
          priority={false}
        />
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: HomeSearchParams;
}) {
  const publishedLayout = await getHomepageLayout(searchParams);

  const visibleSections = new Set(
    publishedLayout ? publishedLayout.blocks.map((block) => block.type) : DEFAULT_SECTION_ORDER
  );

  const orderedSections = publishedLayout
    ? publishedLayout.blocks.map((block) => block.type)
    : DEFAULT_SECTION_ORDER;

  const sectionOrderMap = new Map(orderedSections.map((section, index) => [section, index + 1]));

  const sectionOrder = (section: string): number => {
    return sectionOrderMap.get(section) ?? DEFAULT_SECTION_ORDER.indexOf(section) + 1;
  };

  const heroProps = getSectionProps(publishedLayout, 'hero-section');
  const headerProps = getBlockProps(publishedLayout, 'site-header');
  const footerProps = getBlockProps(publishedLayout, 'site-footer');
  const heroBackground = String(heroProps.bgImage || HERO_BG);
  const systemProps = getSectionProps(publishedLayout, 'system-section');
  const segmentsProps = getSectionProps(publishedLayout, 'segments-section');
  const solutionsProps = getSectionProps(publishedLayout, 'solutions-section');
  const statsProps = getSectionProps(publishedLayout, 'stats-section');
  const partnersProps = getSectionProps(publishedLayout, 'partners-section');

  const systemPillars = parseJsonArray<{ title: string; body: string }>(
    systemProps.pillarsJson,
    ecosystemPillars
  );
  const segmentItems = parseJsonArray<{ title: string; subtitle: string; href: string; icon?: string }>(
    segmentsProps.itemsJson,
    segments.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      href: item.href,
      icon: item.iconKey,
    }))
  );
  const segmentDefaultHrefs = ['/solucoes', '/aliados', '/aliados'] as const;
  const segmentsForRender = segmentItems.map((item, index) => ({
    ...item,
    href:
      typeof item.href === 'string' && item.href.trim().length > 0 && !item.href.trim().startsWith('#')
        ? item.href
        : segmentDefaultHrefs[index % segmentDefaultHrefs.length],
    icon:
      segmentIconMap[String(item.icon ?? '').toLowerCase() as keyof typeof segmentIconMap] ||
      segments[index % segments.length].icon,
  }));

  const solutionsForRender = parseJsonArray<{
    title: string;
    body: string;
    cta: string;
    variant: 'navy' | 'sage' | 'royal';
  }>(solutionsProps.itemsJson, [...solutions]);

  const heroPrimaryHref =
    typeof heroProps.ctaUrl === 'string' && heroProps.ctaUrl.trim() && !heroProps.ctaUrl.trim().startsWith('#')
      ? heroProps.ctaUrl
      : '/solucoes';

  const heroSecondaryHref =
    typeof heroProps.secondaryUrl === 'string' && heroProps.secondaryUrl.trim() && !heroProps.secondaryUrl.trim().startsWith('#')
      ? heroProps.secondaryUrl
      : '/contacto';

  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '#contacto' },
    ]
  );

  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    [
      {
        group: 'Outra parte',
        items: [
          { label: 'Início', href: '/#hero' },
          { label: 'Soluções', href: '/#soluciones' },
          { label: 'Segmentos', href: '/#segmentos' },
        ],
      },
      {
        group: 'Sobre',
        items: [
          { label: 'História e propósito', href: '/sobre' },
          { label: 'Como funciona', href: '/#sistema' },
          { label: 'Parceiros', href: '/#parceiros' },
        ],
      },
    ]
  );

  const socialLinks = parseJsonArray<{ label: string; href: string }>(
    footerProps.socialLinksJson,
    [
      { label: 'Facebook', href: 'https://facebook.com' },
      { label: 'YouTube', href: 'https://youtube.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
    ]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main className="flex flex-col">
        {visibleSections.has('hero-section') && (
          <section
            id="hero"
            data-editor-section="hero-section"
            style={{ order: sectionOrder('hero-section') }}
            className="relative flex min-h-[100dvh] flex-col"
          >
          <div
            className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071F5E]/55 via-[#071F5E]/45 to-black/35" />

          <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-8 sm:pb-24 sm:pt-32">
            <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
              {heroProps.title || 'Transformamos excedentes en negocios sostenibles.'}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/95 sm:text-xl">
              {heroProps.subtitle ||
                'Tecnología, gestión y acceso a mercados para convertir pérdidas en nuevas oportunidades de negocio.'}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={heroPrimaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-[#009179] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b]"
              >
                {heroProps.ctaText || 'Calcule su impacto y lucro'}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
              <a
                href={heroSecondaryHref}
                className="inline-flex items-center gap-2 rounded-md border border-white/35 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-[2px] transition hover:bg-white/15"
              >
                {heroProps.secondaryText || 'Cómo funciona'}
              </a>
            </div>
          </div>
        </section>
        )}

        {visibleSections.has('system-section') && (
        <section
          id="sistema"
              data-editor-section="system-section"
              style={{ order: sectionOrder('system-section'), backgroundColor: systemProps.backgroundColor || '#071F5E' }}
          className="relative scroll-mt-24 overflow-hidden text-white"
        >
          {/* Círculos: semi-círculo à esquerda; centro na borda direita; altura do SVG = 2/3 da secção; topo do anel externo alinhado ao topo (translateY em % do próprio SVG, não altera a escala) */}
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
            <div className="absolute inset-y-0 right-0 h-full w-[min(82vw,44rem)] overflow-hidden sm:w-[min(78%,48rem)] lg:w-[min(72%,56rem)]">
              <svg
                width="920"
                height="920"
                viewBox="0 0 920 920"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                className="absolute right-0 top-0 text-white/[0.14] sm:text-white/[0.13]"
                style={{
                  /* 2/3 da altura do bloco; teto para monitores muito altos */
                  height: 'min(1040px, max(460px, calc((100% * 2) / 3)))',
                  width: 'auto',
                  aspectRatio: '1 / 1',
                  /* 50%: centro do quadrado no vértice direito; Y: cy-r_externo = 460-320 = 140 → sobe 140/920 do lado do SVG */
                  transform: 'translate(50%, calc(-140 / 920 * 100%))',
                }}
              >
                <g stroke="currentColor" strokeWidth="1">
                  <circle cx="460" cy="460" r="118" />
                  <circle cx="460" cy="460" r="170" />
                  <circle cx="460" cy="460" r="222" />
                  <circle cx="460" cy="460" r="274" />
                  <circle cx="460" cy="460" r="320" strokeOpacity="0.75" />
                </g>
              </svg>
            </div>
          </div>

          <div className="relative z-[2] mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <header className="max-w-3xl">
              <h2 className="text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
                {systemProps.title || 'El campo enfrenta grandes desafíos'}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
                {systemProps.subtitle ||
                  'Pérdidas post-cosecha, oscilaciones del mercado y presión por sostenibilidad siguen limitando el crecimiento rural. En Rural Commerce, transformamos esos cuellos de botella en eficiencia, ingresos y seguridad para la cadena.'}
              </p>
            </header>

            <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-16 xl:gap-20">
              {/* Foto + sombra: retângulo branco translúcido, mais para baixo/direita para mostrar mais borda */}
              <div className="mx-auto w-full max-w-[420px] pb-9 pr-9 lg:mx-0 lg:max-w-[460px]">
                <div className="relative aspect-[3/4] w-full">
                  <div
                    className="absolute inset-0 z-0 rounded-xl bg-white/[0.28] sm:bg-white/[0.24]"
                    style={{ transform: 'translate(22px, 28px)' }}
                    aria-hidden
                  />
                  <div className="relative z-10 h-full w-full overflow-hidden rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                    <Image
                      src={ECOSYSTEM_IMG}
                      alt="Productores revisando datos en el campo"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 460px"
                      unoptimized
                      priority
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold leading-snug sm:text-3xl lg:text-[1.75rem] xl:text-3xl">
                  Un sistema completo para transformar la producción rural
                </h3>
                <ul className="mt-8 space-y-8 lg:mt-10 lg:space-y-9">
                  {systemPillars.map((item) => (
                    <li key={item.title}>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/85 sm:text-base">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        )}

        {visibleSections.has('segments-section') && (
        <section
          id="segmentos"
              data-editor-section="segments-section"
          style={{ order: sectionOrder('segments-section'), backgroundColor: segmentsProps.backgroundColor || '#071F5E' }}
          className="scroll-mt-24 py-16 text-white sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">{segmentsProps.title || 'Segmentos que atendemos'}</h2>
            <p className="mt-2 max-w-2xl text-base text-white/80 sm:text-lg">
              {segmentsProps.subtitle || 'Conocé cómo acompañamos a cada actor de la cadena.'}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {segmentsForRender.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.title}
                    href={s.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)] outline-none transition-colors duration-200 hover:border-[#009179] hover:bg-[#009179] focus-visible:ring-2 focus-visible:ring-[#009179] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rc-primary-deep)]"
                  >
                    <div className="min-w-0 flex-1">
                      <Icon
                        className="h-8 w-8 shrink-0 text-[#4C7B5B] transition-colors duration-200 group-hover:text-white"
                        strokeWidth={1.75}
                      />
                      <h3 className="mt-4 text-lg font-semibold text-[#1E1E1E] transition-colors duration-200 group-hover:text-white">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#1E1E1E]/70 transition-colors duration-200 group-hover:text-white/90">
                        {s.subtitle}
                      </p>
                    </div>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1E1E1E]/12 bg-[#1E1E1E]/[0.04] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:border-white/35 group-hover:bg-white/15"
                      aria-hidden
                    >
                      <ArrowRight className="h-4 w-4 text-[#1E1E1E] transition-colors group-hover:text-white" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {visibleSections.has('stats-section') && (
        <section
          style={{ order: sectionOrder('stats-section'), backgroundColor: statsProps.backgroundColor || '#EEF3F7' }}
              data-editor-section="stats-section"
          className="py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-[#071F5E] sm:text-3xl">
              {statsProps.title || 'Números que hablan'}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#1E1E1E]/70">
              {statsProps.subtitle ||
                'Indicativos de impacto y eficiencia en redes acompañadas (valores referenciales).'}
            </p>
            <StatsCarousel />
          </div>
        </section>
        )}

        {visibleSections.has('partners-section') && (
        <section
          id="parceiros"
              data-editor-section="partners-section"
          style={{ order: sectionOrder('partners-section'), backgroundColor: partnersProps.backgroundColor || '#F5F7FB' }}
          className="scroll-mt-24 border-y border-[#071F5E]/10 py-14 sm:py-16"
          aria-labelledby="partners-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="partners-heading" className="text-center text-2xl font-bold text-[#071F5E] sm:text-3xl">
              {partnersProps.title || 'Parceiros de Confianza'}
            </h2>
            <PartnersLogosCarousel 
              partners={partnersProps.partnersJson ? parseJsonArray(partnersProps.partnersJson, []) : undefined}
            />
          </div>
        </section>
        )}
      </main>

      <RuralCommerceFooter
        title={String(footerProps.title || 'Rural Commerce')}
        copyright={String(footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} — Todos os direitos reservados`)}
        contactTitle={String(footerProps.contactTitle || 'Contato')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay — endereço comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 · · · · ·')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociais')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
      />
    </div>
  );
}
