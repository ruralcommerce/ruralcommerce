import Image from 'next/image';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { CalcSection } from '@/components/CalcSection';
import {
  BarChart3,
  BookOpen,
  Check,
  Droplets,
  Globe,
  Palette,
  ShieldCheck,
  Sprout,
  Sun,
  Tag,
} from 'lucide-react';
import { getBlockProps, getFirstFreeTextContent, getManagedPageLayout, getSectionProps, LayoutSearchParams, parseJsonArray } from '@/lib/page-layout-runtime';

export const metadata = {
  title: 'Soluções — Rural Commerce',
  description: 'Elegí tu camino hacia la rentabilidad sustentable. Combos, complementos y financiamiento para el campo.',
};

const HERO_BG = '/images/solucoes/solucoes-hero.png';

const combos = [
  {
    name: 'Combos de Negocio',
    subtitle: 'Soluciones integrales de implementación rápida para retos específicos.',
    features: [
      'Diagnóstico profundo del negocio.',
      'Pack de productos + servicios técnicos de ejecución.',
      'Enfoque en transformación y/o creación de modelos de negocios',
    ],
    variant: 'outline' as const,
    buttonText: 'Ver Combos',
  },
  {
    name: 'Membresía Estratégica',
    subtitle: 'Acompañamiento técnico constante para una operación eficiente y para potenciar el desarrollo',
    features: [
      'Asesoría 24/7 con IA especializada en agronegocios',
      'Consultoría estratégica personalizada (según su plan)',
      'Monitoreo continuo de eficiencia y procesos',
    ],
    variant: 'filled' as const,
    buttonText: 'Ver Planes',
  },
  {
    name: 'Servicios y Add-ons',
    subtitle: 'Soluciones técnicas y quirúrgicas para potenciar su operación actual.',
    features: [
      'Diagnósticos especializados y certificaciones de calidad.',
      'Diseño de marca, marketing rural y asesoría comercial.',
      'Intervenciones técnicas puntuales según su necesidad.',
      'Acceso preferencial para miembros de nuestra red.',
    ],
    variant: 'outline' as const,
    buttonText: 'Explorar Servicios',
  },
];

const addons = [
  {
    Icon: BarChart3,
    name: 'RC MAPA',
    desc: 'Visualizá y gestioná tu operación con información clara y centralizada.',
  },
  {
    Icon: Sprout,
    name: 'ERP Rural',
    desc: 'Controlá tu producción, costos y resultados en un solo lugar.',
  },
  {
    Icon: BookOpen,
    name: 'Capacitación Financiera',
    desc: 'Mejorá la gestión de tu negocio y tomá decisiones más rentables.',
  },
  {
    Icon: Droplets,
    name: 'Riego',
    desc: 'Optimiza el uso del agua y aseguá la continuidad de tu producción.',
  },
  {
    Icon: Sun,
    name: 'Bomba Solar',
    desc: 'Reducí costos de energía y hacé tu operación más eficiente.',
  },
  {
    Icon: ShieldCheck,
    name: 'Selladora',
    desc: 'Dale terminación profesional a tus productos y aumentá su valor.',
  },
  {
    Icon: Palette,
    name: 'Branding',
    desc: 'Convertí tu producto en una marca reconocida y competitiva.',
  },
  {
    Icon: Tag,
    name: 'Etiquetado y Rótulos',
    desc: 'Cumplí normativas y destaque en el punto de venta.',
  },
  {
    Icon: Globe,
    name: 'Campañas Digitales',
    desc: 'Llegá a nuevos clientes y aumentá la demanda de tus productos.',
  },
];

export default async function SolucoesPage({
  searchParams,
}: {
  searchParams?: LayoutSearchParams;
}) {
  const layout = await getManagedPageLayout('solucoes', searchParams);
  const siteLayout = await getManagedPageLayout('homepage', searchParams);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const heroProps = getSectionProps(layout, 'hero-section');
  const freeTextContent = getFirstFreeTextContent(layout);
  const heroBackground = String(heroProps.bgImage || HERO_BG);
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(headerProps.navItemsJson, [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Aliados e Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '#contacto' },
  ]);
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(footerProps.footerLinksJson, []);
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main>
        {/* ── Bloco 1: Hero ─────────────────────────────────── */}
        <section id="hero" data-editor-section="hero-section" className="relative flex min-h-[100dvh] flex-col">
          <div
            className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071F5E]/55 via-[#071F5E]/45 to-black/35" />

          <div className="relative flex flex-1 flex-col items-start justify-center px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:px-12 md:ml-[10%] md:-mt-[3%]">
            <h1
              className="max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-[56px] md:leading-[63px] md:tracking-[-2px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.title || 'La inteligencia que su negocio necesita para madurar y escalar'}
            </h1>
            <p
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/95 sm:text-lg md:text-[19px] md:leading-[30px] md:tracking-[0px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.subtitle ||
                'Impulse su rentabilidad con nuestro ecosistema de soluciones rurales. Desde asesoría técnica con IA y formación experta, hasta la captación de fondos para escalar su impacto.'}
            </p>
            <div className="mt-7">
              <a
                href={heroProps.ctaUrl || '/contacto'}
                className="inline-flex items-center justify-center rounded-xl bg-[#009179] px-7 py-3 text-sm font-bold leading-snug tracking-tight text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b] sm:text-base md:px-8 md:py-3 md:text-sm"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                {heroProps.ctaText || 'Contactar'}
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

        {/* ── Bloco 2: Nuestras Rutas ───────────────────────── */}
        <section id="combos" data-editor-section="solutions-section" className="scroll-mt-20 bg-[#FFFFFF] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-[#1E1E1E] sm:text-4xl" style={{ transform: 'scale(1.08)', transformOrigin: 'center top' }}>
              Nuestras Rutas
            </h2>

            <div className="mt-16 grid gap-6 sm:grid-cols-3" style={{ transform: 'scale(1.08)', transformOrigin: 'center top' }}>
              {combos.map((c, idx) => (
                <div
                  key={c.name}
                  className={`flex flex-col rounded-lg border p-10 ${
                    c.variant === 'filled'
                      ? 'border-[#009179] bg-[#009179] text-white shadow-xl'
                      : 'border-[#071F5E] bg-[#071F5E] text-white shadow-sm'
                  }`}
                >
                  <h3
                    className="text-lg font-bold leading-snug text-white"
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                    }}
                  >
                    {c.name}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-white/90"
                  >
                    {c.subtitle}
                  </p>

                  <ul className="mt-7 flex-1 space-y-3">
                    {c.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm leading-snug">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-white"
                          strokeWidth={2.5}
                        />
                        <span className="text-white/90">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/contacto"
                    className="mt-8 block rounded-lg px-6 py-3 text-center text-sm font-semibold transition bg-white text-[#071F5E] hover:bg-white/90"
                  >
                    Contactar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bloco 3: Viabilização ─────────────────────────── */}
        <section data-editor-section="stats-section" className="bg-[#00071B] py-16 text-center text-white sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold leading-snug sm:text-4xl">
              ¿Busca capital para su próximo paso?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
              Identificamos convocatorias y diseñamos su proyecto para captar fondos de inversión o desarrollo. Trabajamos a éxito: solo ganamos si usted gana.
            </p>
            <a
              href="/contacto"
              className="mt-8 inline-block rounded-md bg-[#009179] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#007d6b]"
            >
              Quiero saber más
            </a>
          </div>
        </section>

        {/* ── Bloco 4: Calculadora ──────────────────────────── */}
        <section data-editor-section="partners-section">
          <CalcSection />
        </section>
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
