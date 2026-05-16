import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Leaf,
  Tractor,
  Users,
} from 'lucide-react';
import { PartnersLogosCarousel } from '@/components/PartnersLogosCarousel';
import { SiteStreamBlocks, isStreamBlockType } from '@/components/SiteStreamBlocks';
import { StatsCarousel } from '@/components/StatsCarousel';
import type { BlockData } from '@/lib/editor-types';
import { parseJsonArray } from '@/lib/page-layout-runtime';

const HERO_BG = '/images/home/hero-1.png';
const ECOSYSTEM_IMG = '/images/home/home-pic2.png?v=20260510';

const ecosystemPillars = [
  { title: 'Hardware de Precisión', body: 'Equipos modulares orientados a optimizar procesos, reducir costos y agregar valor a la producción.' },
  { title: 'Software de Inteligencia y Gestión', body: 'Herramientas que centralizan la gestión del negocio y el monitoreo de la producción, entregando indicadores y seguridad para la toma de decisiones.' },
  { title: 'Gestión de Rescate y Valorización', body: 'Procesos comerciales que transforman mermas en productos vendibles con vida útil extendida, evitando emisiones por descarte.' },
  { title: 'Metodología de Aceleración', body: 'Marco práctico para estandarizar calidad, estructurar márgenes y abrir canales comerciales.' },
];

const segments = [
  { title: 'Productores', subtitle: 'Escala tu negocio', iconKey: 'tractor', icon: Tractor, href: '/solucoes' },
  { title: 'Empresas ESG / cadena de suministro', subtitle: 'Eficiencia y trazabilidad', iconKey: 'leaf', icon: Leaf, href: '/aliados' },
  { title: 'Gobiernos', subtitle: 'Desarrollo territorial', iconKey: 'building2', icon: Building2, href: '/aliados' },
] as const;

const segmentIconMap = {
  tractor: Tractor,
  leaf: Leaf,
  building2: Building2,
  users: Users,
} as const;

const solutions = [
  { title: 'Diagnóstico de Eficiencia', body: 'Descubra dónde está perdiendo dinero su negocio.', cta: 'Saber más', variant: 'navy' as const },
  { title: 'Curso de Procesamiento y Gestión', body: 'Capacitación técnica para el estándar de retail (comercio minorista).', cta: 'Saber más', variant: 'sage' as const },
  { title: 'Kit de Implementación Rápida', body: 'Tecnología y metodología para comenzar a generar ganancias hoy mismo.', cta: 'Saber más', variant: 'royal' as const },
];

function ensureLocaleHref(locale: string, href: string): string {
  const t = href.trim();
  if (!t.startsWith('/') || t.startsWith('//') || /^https?:\/\//i.test(t)) return t;
  if (/^\/(es|pt-BR|en)(\/|$)/.test(t)) return t;
  return `/${locale}${t === '/' ? '' : t}`;
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
          alt="Ilustración de la tarjeta de soluciones"
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 100vw, 350px"
          priority={false}
        />
      </div>
    </div>
  );
}

export function HomeMainBlocks({ blocks, locale, systemHeading }: { blocks: BlockData[]; locale: string; systemHeading: string }) {
  return (
    <>
      {blocks.map((block, i) => {
        const order = i + 1;
        const p = block.props as Record<string, any>;

        if (isStreamBlockType(block.type)) {
          return (
            <SiteStreamBlocks
              key={block.id}
              blocks={[block]}
              locale={locale}
              getSectionOrder={() => order}
            />
          );
        }

        switch (block.type) {
          case 'hero-section': {
            const heroBackground = String(p.bgImage || HERO_BG);
            const heroPrimaryHref = ensureLocaleHref(
              locale,
              typeof p.ctaUrl === 'string' && p.ctaUrl.trim() && !p.ctaUrl.trim().startsWith('#') ? p.ctaUrl.trim() : '/solucoes'
            );
            const heroSecondaryHref = ensureLocaleHref(
              locale,
              typeof p.secondaryUrl === 'string' && p.secondaryUrl.trim() && !p.secondaryUrl.trim().startsWith('#')
                ? p.secondaryUrl.trim()
                : '/contacto'
            );
            return (
              <section
                key={block.id}
                id="hero"
                data-editor-block-id={block.id}
                data-editor-section="hero-section"
                style={{ order }}
                className="relative flex min-h-[100dvh] flex-col"
              >
                <div className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat" style={{ backgroundImage: `url(${heroBackground})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#071F5E]/55 via-[#071F5E]/45 to-black/35" />
                <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-8 sm:pb-24 sm:pt-32">
                  <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
                    {p.title || 'Transformamos excedentes en negocios sostenibles.'}
                  </h1>
                  <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/95 sm:text-xl">
                    {p.subtitle ||
                      'Tecnologia, gestion y acceso a mercados para convertir perdidas en nuevas oportunidades de negocio.'}
                  </p>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <a
                      href={heroPrimaryHref}
                      className="inline-flex items-center gap-2 rounded-md bg-[#009179] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b]"
                    >
                      {p.ctaText || 'Calcule su impacto y lucro'}
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </a>
                    <a
                      href={heroSecondaryHref}
                      className="inline-flex items-center gap-2 rounded-md border border-white/35 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-[2px] transition hover:bg-white/15"
                    >
                      {p.secondaryText || 'Como funciona'}
                    </a>
                  </div>
                </div>
              </section>
            );
          }
          case 'system-section': {
            const systemPillars = parseJsonArray<{ title: string; body: string }>(p.pillarsJson, ecosystemPillars);
            const sideRaw = typeof p.sideImage === 'string' ? p.sideImage.trim() : '';
            const systemPhotoSrc = sideRaw || ECOSYSTEM_IMG;
            const systemPhotoIsLocal = systemPhotoSrc.startsWith('/');
            return (
              <section
                key={block.id}
                id="sistema"
                data-editor-block-id={block.id}
                data-editor-section="system-section"
                style={{ order, backgroundColor: p.backgroundColor || '#071F5E' }}
                className="relative scroll-mt-24 overflow-hidden text-white"
              >
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
                        height: 'min(1040px, max(460px, calc((100% * 2) / 3)))',
                        width: 'auto',
                        aspectRatio: '1 / 1',
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
                      {p.title || 'El campo enfrenta grandes desafios'}
                    </h2>
                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
                      {p.subtitle ||
                        'Perdidas post-cosecha, oscilaciones del mercado y presion por sostenibilidad siguen limitando el crecimiento rural. En Rural Commerce, transformamos esos cuellos de botella en eficiencia, ingresos y seguridad para la cadena.'}
                    </p>
                  </header>
                  <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                    <div className="mx-auto w-full max-w-[420px] pb-9 pr-9 lg:mx-0 lg:max-w-[460px]">
                      <div className="relative aspect-[3/4] w-full">
                        <div
                          className="absolute inset-0 z-0 rounded-xl bg-white/[0.28] sm:bg-white/[0.24]"
                          style={{ transform: 'translate(22px, 28px)' }}
                          aria-hidden
                        />
                        <div className="relative z-10 h-full w-full overflow-hidden rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                          {systemPhotoIsLocal ? (
                            <Image
                              src={systemPhotoSrc}
                              alt="Productores revisando datos en el campo"
                              fill
                              className="object-cover object-center"
                              sizes="(max-width: 1024px) 100vw, 460px"
                              unoptimized
                              priority
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- URLs externas (biblioteca / CDN) sem remotePatterns
                            <img
                              src={systemPhotoSrc}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover object-center"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold leading-snug sm:text-3xl lg:text-[1.75rem] xl:text-3xl">{systemHeading}</h3>
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
            );
          }
          case 'segments-section': {
            const segmentItems = parseJsonArray<{ title: string; subtitle: string; href: string; icon?: string }>(
              p.itemsJson,
              segments.map((item) => ({
                title: item.title,
                subtitle: item.subtitle,
                href: item.href,
                icon: item.iconKey,
              }))
            );
            const segmentDefaultHrefs = ['/solucoes', '/aliados', '/aliados'] as const;
            const segmentsForRender = segmentItems.map((item, index) => {
              const defaultSegment = segments[index % segments.length];
              return {
                ...item,
                href:
                  typeof item.href === 'string' && item.href.trim().length > 0 && !item.href.trim().startsWith('#')
                    ? item.href
                    : segmentDefaultHrefs[index % segmentDefaultHrefs.length],
                icon:
                  segmentIconMap[String(item.icon ?? '').toLowerCase() as keyof typeof segmentIconMap] ||
                  defaultSegment.icon,
              };
            });
            return (
              <section
                key={block.id}
                id="segmentos"
                data-editor-block-id={block.id}
                data-editor-section="segments-section"
                style={{ order, backgroundColor: p.backgroundColor || '#071F5E' }}
                className="scroll-mt-24 py-16 text-white sm:py-20"
              >
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <h2 className="text-2xl font-bold sm:text-3xl">{p.title || 'Segmentos que atendemos'}</h2>
                  <p className="mt-2 max-w-2xl text-base text-white/80 sm:text-lg">
                    {p.subtitle || 'Conoce como acompanamos a cada actor de la cadena.'}
                  </p>
                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {segmentsForRender.map((s) => {
                      const Icon = s.icon ?? Tractor;
                      return (
                        <Link
                          key={s.title}
                          href={ensureLocaleHref(locale, s.href)}
                          className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)] outline-none transition-colors duration-200 hover:border-[#009179] hover:bg-[#009179]"
                        >
                          <div className="min-w-0 flex-1">
                            <Icon className="h-8 w-8 shrink-0 text-[#4C7B5B] transition-colors duration-200 group-hover:text-white" strokeWidth={1.75} />
                            <h3 className="mt-4 text-lg font-semibold text-[#1E1E1E] transition-colors duration-200 group-hover:text-white">{s.title}</h3>
                            <p className="mt-1 text-sm text-[#1E1E1E]/70 transition-colors duration-200 group-hover:text-white/90">{s.subtitle}</p>
                          </div>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1E1E1E]/12 bg-[#1E1E1E]/[0.04] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:border-white/35 group-hover:bg-white/15" aria-hidden>
                            <ArrowRight className="h-4 w-4 text-[#1E1E1E] transition-colors group-hover:text-white" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          case 'solutions-section': {
            const items = parseJsonArray<{ title: string; body: string; cta: string; variant: 'navy' | 'sage' | 'royal' }>(
              p.itemsJson,
              [...solutions]
            );
            return (
              <section
                key={block.id}
                id="soluciones"
                data-editor-block-id={block.id}
                data-editor-section="solutions-section"
                style={{ order, backgroundColor: p.backgroundColor || '#F5F7FB' }}
                className="scroll-mt-24 border-y border-[#071F5E]/10 py-16 sm:py-20"
              >
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <h2 className="text-center text-2xl font-bold text-[#071F5E] sm:text-3xl">{p.title || 'Un camino claro'}</h2>
                  <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {items.map((it) => (
                      <div key={it.title} className="flex flex-col overflow-hidden rounded-2xl border border-[#071F5E]/10 bg-white shadow-sm">
                        <SolutionIllustration variant={it.variant} />
                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="text-lg font-semibold text-[#071F5E]">{it.title}</h3>
                          <p className="mt-2 flex-1 text-sm text-slate-600">{it.body}</p>
                          <span className="mt-4 text-sm font-semibold text-[#009179]">{it.cta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }
          case 'stats-section':
            return (
              <section
                key={block.id}
                data-editor-block-id={block.id}
                data-editor-section="stats-section"
                style={{ order, backgroundColor: p.backgroundColor || '#EEF3F7' }}
                className="py-16 sm:py-20"
              >
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <h2 className="text-center text-2xl font-bold text-[#071F5E] sm:text-3xl">{p.title || 'Numeros que hablan'}</h2>
                  <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#1E1E1E]/70">
                    {p.subtitle ||
                      'Indicadores de impacto y eficiencia en redes acompañadas (valores referenciales).'}
                  </p>
                  <StatsCarousel locale={locale} statsJson={p.statsJson} />
                </div>
              </section>
            );
          case 'partners-section':
            return (
              <section
                key={block.id}
                id="Socios"
                data-editor-block-id={block.id}
                data-editor-section="partners-section"
                style={{ order, backgroundColor: p.backgroundColor || '#F5F7FB' }}
                className="scroll-mt-24 border-y border-[#071F5E]/10 py-14 sm:py-16"
                aria-labelledby={`partners-heading-${block.id}`}
              >
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                  <h2 id={`partners-heading-${block.id}`} className="text-center text-2xl font-bold text-[#071F5E] sm:text-3xl">
                    {p.title || 'Socios de confianza'}
                  </h2>
                  <PartnersLogosCarousel
                    locale={locale}
                    partners={p.partnersJson ? parseJsonArray(p.partnersJson, []) : undefined}
                  />
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
