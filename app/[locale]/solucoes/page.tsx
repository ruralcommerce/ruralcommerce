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
  title: 'Soluciones - Rural Commerce',
  description: 'Elegi tu camino hacia la rentabilidad sustentable. Combos, complementos y financiamiento para el campo.',
};

const HERO_BG = '/images/solucoes/solucoes-hero.png';

const combos = [
  {
    name: 'Combos de Negocio',
    subtitle: 'Soluciones integrales de implementacion rapida para retos especificos.',
    features: [
      'Diagnostico profundo del negocio.',
      'Pack de productos + servicios tecnicos de ejecucion.',
      'Enfoque en transformacion y/o creacion de modelos de negocios',
    ],
    variant: 'outline' as const,
    buttonText: 'Ver Combos',
  },
  {
    name: 'Membresia Estrategica',
    subtitle: 'Acompanamiento tecnico constante para una operacion eficiente y para potenciar el desarrollo',
    features: [
      'Asesoria 24/7 con IA especializada en agronegocios',
      'Consultoria estrategica personalizada (segun su plan)',
      'Monitoreo continuo de eficiencia y procesos',
    ],
    variant: 'filled' as const,
    buttonText: 'Ver Planes',
  },
  {
    name: 'Servicios y Add-ons',
    subtitle: 'Soluciones tecnicas y quirurgicas para potenciar su operacion actual.',
    features: [
      'Diagnosticos especializados y certificaciones de calidad.',
      'Diseno de marca, marketing rural y asesoria comercial.',
      'Intervenciones tecnicas puntuales segun su necesidad.',
      'Acceso preferencial para miembros de nuestra red.',
    ],
    variant: 'outline' as const,
    buttonText: 'Explorar Servicios',
  },
];

const combosByLocale = {
  es: combos,
  'pt-BR': [
    {
      name: 'Combos de Negocio',
      subtitle: 'Soluções integradas de implementação rápida para desafios específicos.',
      features: [
        'Diagnóstico profundo do negócio.',
        'Pacote de produtos + serviços técnicos de execução.',
        'Foco em transformação e/ou criação de modelos de negócio.',
      ],
      variant: 'outline' as const,
      buttonText: 'Ver combos',
    },
    {
      name: 'Assinatura Estratégica',
      subtitle: 'Acompanhamento técnico contínuo para uma operação eficiente e para potencializar o desenvolvimento.',
      features: [
        'Assessoria 24/7 com IA especializada em agronegócio.',
        'Consultoria estratégica personalizada (conforme seu plano).',
        'Monitoramento contínuo de eficiência e processos.',
      ],
      variant: 'filled' as const,
      buttonText: 'Ver planos',
    },
    {
      name: 'Serviços e Add-ons',
      subtitle: 'Soluções técnicas e cirúrgicas para potencializar sua operação atual.',
      features: [
        'Diagnósticos especializados e certificações de qualidade.',
        'Design de marca, marketing rural e assessoria comercial.',
        'Intervenções técnicas pontuais conforme sua necessidade.',
        'Acesso preferencial para membros da nossa rede.',
      ],
      variant: 'outline' as const,
      buttonText: 'Explorar serviços',
    },
  ],
  en: [
    {
      name: 'Business Bundles',
      subtitle: 'Integrated rapid-implementation solutions for specific challenges.',
      features: [
        'In-depth business diagnosis.',
        'Product bundle + technical execution services.',
        'Focus on transforming and/or creating business models.',
      ],
      variant: 'outline' as const,
      buttonText: 'View bundles',
    },
    {
      name: 'Strategic Membership',
      subtitle: 'Continuous technical support for efficient operations and scalable development.',
      features: [
        '24/7 advisory with AI specialized in agribusiness.',
        'Personalized strategic consulting (according to your plan).',
        'Continuous efficiency and process monitoring.',
      ],
      variant: 'filled' as const,
      buttonText: 'View plans',
    },
    {
      name: 'Services and Add-ons',
      subtitle: 'Targeted technical solutions to boost your current operation.',
      features: [
        'Specialized diagnostics and quality certifications.',
        'Brand design, rural marketing, and commercial advisory.',
        'Targeted technical interventions based on your needs.',
        'Preferred access for members of our network.',
      ],
      variant: 'outline' as const,
      buttonText: 'Explore services',
    },
  ],
} as const;

const addons = [
  {
    Icon: BarChart3,
    name: 'RC MAPA',
    desc: 'Visualiza y gestiona tu operacion con informacion clara y centralizada.',
  },
  {
    Icon: Sprout,
    name: 'ERP Rural',
    desc: 'Controla tu produccion, costos y resultados en un solo lugar.',
  },
  {
    Icon: BookOpen,
    name: 'Capacitacion Financiera',
    desc: 'Mejora la gestion de tu negocio y toma decisiones mas rentables.',
  },
  {
    Icon: Droplets,
    name: 'Riego',
    desc: 'Optimiza el uso del agua y asegura la continuidad de tu produccion.',
  },
  {
    Icon: Sun,
    name: 'Bomba Solar',
    desc: 'Reduce costos de energia y haz tu operacion mas eficiente.',
  },
  {
    Icon: ShieldCheck,
    name: 'Selladora',
    desc: 'Dale terminacion profesional a tus productos y aumenta su valor.',
  },
  {
    Icon: Palette,
    name: 'Branding',
    desc: 'Convierte tu producto en una marca reconocida y competitiva.',
  },
  {
    Icon: Tag,
    name: 'Etiquetado y Rotulos',
    desc: 'Cumple normativas y destaca en el punto de venta.',
  },
  {
    Icon: Globe,
    name: 'Campanas Digitales',
    desc: 'Llega a nuevos clientes y aumenta la demanda de tus productos.',
  },
];

export default async function SolucoesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const layout = await getManagedPageLayout('solucoes', searchParams, params.locale);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const heroProps = getSectionProps(layout, 'hero-section');
  const freeTextContent = getFirstFreeTextContent(layout);
  const locale = params.locale === 'pt-BR' || params.locale === 'en' ? params.locale : 'es';
  const contactHref = `/${locale}#contacto`;
  const localizedCombos = combosByLocale[locale];
  const routesTitle =
    locale === 'pt-BR' ? 'Nossas Rotas' : locale === 'en' ? 'Our Paths' : 'Nuestras Rutas';
  const heroFallbackTitle =
    locale === 'pt-BR'
      ? 'A inteligência que o seu negócio precisa para amadurecer e escalar'
      : locale === 'en'
      ? 'The intelligence your business needs to mature and scale'
      : 'La inteligencia que su negocio necesita para madurar y escalar';
  const heroFallbackSubtitle =
    locale === 'pt-BR'
      ? 'Impulse sua rentabilidade com nosso ecossistema de soluções rurais. De assessoria técnica com IA e formação especializada até captação de fundos para escalar seu impacto.'
      : locale === 'en'
      ? 'Boost your profitability with our ecosystem of rural solutions. From AI-powered technical advisory and expert training to fundraising for scaling impact.'
      : 'Impulse su rentabilidad con nuestro ecosistema de soluciones rurales. Desde asesoría técnica con IA y formación experta, hasta la captación de fondos para escalar su impacto.';
  const contactLabel = locale === 'pt-BR' ? 'Contato' : locale === 'en' ? 'Contact' : 'Contactar';
  const capitalTitle =
    locale === 'pt-BR'
      ? 'Busca capital para seu próximo passo?'
      : locale === 'en'
      ? 'Looking for capital for your next step?'
      : '¿Busca capital para su próximo paso?';
  const capitalBody =
    locale === 'pt-BR'
      ? 'Identificamos editais e desenhamos seu projeto para captar recursos de investimento ou desenvolvimento. Trabalhamos por sucesso: só ganhamos se você ganha.'
      : locale === 'en'
      ? 'We identify funding calls and design your project to secure investment or development capital. We work on success: we only win when you win.'
      : 'Identificamos convocatorias y diseñamos su proyecto para captar fondos de inversión o desarrollo. Trabajamos a éxito: solo ganamos si usted gana.';
  const capitalCta =
    locale === 'pt-BR' ? 'Quero saber mais' : locale === 'en' ? 'I want to learn more' : 'Quiero saber más';
  const heroBackground = String(heroProps.bgImage || HERO_BG);
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(headerProps.navItemsJson, [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluciones', href: '/solucoes' },
    { label: 'Aliados y Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '#contacto' },
  ]);
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#071F5E]/55 via-[#071F5E]/45 to-black/35" />

          <div className="relative flex flex-1 flex-col items-start justify-center px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:px-12 md:ml-[10%] md:-mt-[3%]">
            <h1
              className="max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-[56px] md:leading-[63px] md:tracking-[-2px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.title || heroFallbackTitle}
            </h1>
            <p
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/95 sm:text-lg md:text-[19px] md:leading-[30px] md:tracking-[0px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.subtitle || heroFallbackSubtitle}
            </p>
            <div className="mt-7">
              <a
                href={heroProps.ctaUrl || contactHref}
                className="inline-flex items-center justify-center rounded-xl bg-[#009179] px-7 py-3 text-sm font-bold leading-snug tracking-tight text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b] sm:text-base md:px-8 md:py-3 md:text-sm"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                {heroProps.ctaText || contactLabel}
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

        {/* Bloco 2: Nossas Rotas */}
        <section id="combos" data-editor-section="solutions-section" className="scroll-mt-20 bg-[#FFFFFF] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-[#1E1E1E] sm:text-4xl" style={{ transform: 'scale(1.08)', transformOrigin: 'center top' }}>
              {routesTitle}
            </h2>

            <div className="mt-16 grid gap-6 sm:grid-cols-3" style={{ transform: 'scale(1.08)', transformOrigin: 'center top' }}>
              {localizedCombos.map((c, idx) => (
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
                    href={contactHref}
                    className="mt-8 block rounded-lg px-6 py-3 text-center text-sm font-semibold transition bg-white text-[#071F5E] hover:bg-white/90"
                  >
                    {contactLabel}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 3: Viabilizacao */}
        <section data-editor-section="stats-section" className="bg-[#00071B] py-16 text-center text-white sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold leading-snug sm:text-4xl">
              {capitalTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
              {capitalBody}
            </p>
            <a
              href={contactHref}
              className="mt-8 inline-block rounded-md bg-[#009179] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#007d6b]"
            >
              {capitalCta}
            </a>
          </div>
        </section>

        {/* Bloco 4: Calculadora */}
        <section data-editor-section="partners-section">
          <CalcSection locale={locale} />
        </section>
      </main>

      <RuralCommerceFooter
        locale={locale}
        title={String(footerProps.title || 'Rural Commerce')}
        copyright={String(footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`)}
        contactTitle={String(footerProps.contactTitle || 'Contacto')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay - direccion comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 - - - - -')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociales')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
      />
    </div>
  );
}

