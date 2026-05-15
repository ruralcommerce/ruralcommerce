import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { LayoutBlocksRenderer } from '@/components/LayoutBlocksRenderer';
import Image from 'next/image';
import { Cpu, DollarSign, GraduationCap, Leaf } from 'lucide-react';
import { getBlockProps, getFirstFreeTextContent, getManagedPageLayout, getSectionProps, LayoutSearchParams, parseJsonArray } from '@/lib/page-layout-runtime';
import { RuralCommerceFooter as SiteFooter } from '@/components/RuralCommerceFooter';
import type { Metadata } from 'next';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const aboutCopy = {
  es: {
    metadataTitle: 'Sobre — Rural Commerce',
    metadataDescription:
      'Nuestra historia y propósito: cerrar la brecha entre la producción primaria y el mercado de mayor valor.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
    ],
    heroTitle: 'Inteligencia Sistémica para Cadenas Regenerativas y Rentables',
    heroSubtitle:
      'Rural Commerce es un ecosistema de innovación que integra tecnología de precisión, inteligencia de datos y metodologías de aceleración para transformar los desafíos estructurales del campo en activos de alto valor. Actuamos como el socio estratégico que conecta la base productora rural con los estándares de los mercados globales, eliminando el desperdicio y descarbonizando la cadena de suministro de manera auditable.',
    heroCta: 'Conocer Soluciones',
    frontsTitle:
      'Implementamos ecosistemas que resuelven problemáticas sistémicas del campo en cuatro frentes críticos simultáneamente',
    fronts: [
      {
        title: 'Eficiencia Ambiental',
        body: 'Reducción de desperdicios y emisiones de GEI (metano/CO2e)',
      },
      {
        title: 'Eficiencia Operativa y Tecnológica',
        body: 'Hardware y software de precisión para eficiencia productiva',
      },
      {
        title: 'Eficiencia Financiera y Empresarial',
        body: 'Optimización de márgenes, reducción de costos logísticos y nuevos flujos de caja',
      },
      {
        title: 'Formación y Capacitación Técnica',
        body: 'Desarrollo de capacidades locales para sostener autonomía, calidad y escalabilidad.',
      },
    ],
    supportTitle: 'Respaldo y Certificaciones Internacionales',
    supportTagline:
      'Respaldamos cada intervención con alianzas técnicas y estándares internacionales de implementación.',
    cert1Title: 'IICA (Instituto Interamericano de Cooperación para la Agricultura)',
    cert1Body: 'Validación de impacto en desarrollo rural y seguridad alimentaria en los Andes.',
    cert2Title: 'MDC PUCV (Núcleo de Biotecnología UCURO - Chile)',
    cert2Body: 'Validación de procesos de deshidratación y eficiencia biotecnológica aplicada al agro.',
    ctaTitle: '¿Quieres conocer más sobre nuestra metodología y soluciones?',
    ctaAction: 'Contactar con un asesor →',
  },
  'pt-BR': {
    metadataTitle: 'Sobre — Rural Commerce',
    metadataDescription:
      'Nossa história e propósito: reduzir a distância entre a produção primária e os mercados de maior valor.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Aliados e Investidores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contacto' },
    ],
    heroTitle: 'Inteligência Sistêmica para Cadeias Regenerativas e Rentáveis',
    heroSubtitle:
      'A Rural Commerce é um ecossistema de inovação que integra tecnologia de precisão, inteligência de dados e metodologias de aceleração para transformar desafios estruturais do campo em ativos de alto valor. Atuamos como parceiro estratégico conectando a base produtora rural aos padrões dos mercados globais, reduzindo perdas e descarbonizando a cadeia de suprimentos com rastreabilidade.',
    heroCta: 'Conhecer Soluções',
    frontsTitle:
      'Implementamos ecossistemas que resolvem desafios sistêmicos do campo em quatro frentes críticas ao mesmo tempo',
    fronts: [
      {
        title: 'Eficiência Ambiental',
        body: 'Redução de desperdícios e emissões de GEE (metano/CO2e)',
      },
      {
        title: 'Eficiência Operacional e Tecnológica',
        body: 'Hardware e software de precisão para eficiência produtiva',
      },
      {
        title: 'Eficiência Financeira e Empresarial',
        body: 'Otimização de margens, redução de custos logísticos e novos fluxos de caixa',
      },
      {
        title: 'Formação e Capacitação Técnica',
        body: 'Desenvolvimento de capacidades locais para sustentar autonomia, qualidade e escalabilidade.',
      },
    ],
    supportTitle: 'Respaldo e Certificações Internacionais',
    supportTagline:
      'Sustentamos cada intervenção com alianças técnicas e padrões internacionais de execução.',
    cert1Title: 'IICA (Instituto Interamericano de Cooperação para a Agricultura)',
    cert1Body: 'Validação de impacto em desenvolvimento rural e segurança alimentar nos Andes.',
    cert2Title: 'MDC PUCV (Núcleo de Biotecnologia UCURO - Chile)',
    cert2Body: 'Validação de processos de desidratação e eficiência biotecnológica aplicada ao agro.',
    ctaTitle: 'Quer conhecer mais sobre nossa metodologia e soluções?',
    ctaAction: 'Falar com um consultor →',
  },
  en: {
    metadataTitle: 'About — Rural Commerce',
    metadataDescription:
      'Our story and purpose: closing the gap between primary production and higher-value markets.',
    navItems: [
      { label: 'About', href: '/sobre' },
      { label: 'Solutions', href: '/solucoes' },
      { label: 'Partners & Investors', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contacto' },
    ],
    heroTitle: 'Systemic Intelligence for Regenerative and Profitable Value Chains',
    heroSubtitle:
      'Rural Commerce is an innovation ecosystem combining precision technology, data intelligence, and acceleration methods to transform structural field challenges into high-value assets. We act as the strategic partner connecting rural producers to global market standards, cutting waste and decarbonizing supply chains with auditable results.',
    heroCta: 'Explore Solutions',
    frontsTitle:
      'We build ecosystems that solve systemic rural challenges across four critical fronts simultaneously',
    fronts: [
      {
        title: 'Environmental Efficiency',
        body: 'Reduction of waste and GHG emissions (methane/CO2e)',
      },
      {
        title: 'Operational and Technological Efficiency',
        body: 'Precision hardware and software for productive efficiency',
      },
      {
        title: 'Financial and Business Efficiency',
        body: 'Margin optimization, logistics cost reduction, and new cash-flow streams',
      },
      {
        title: 'Technical Training and Upskilling',
        body: 'Local capability development to sustain autonomy, quality, and long-term scale.',
      },
    ],
    supportTitle: 'International Backing and Certifications',
    supportTagline:
      'Every intervention is supported by technical partnerships and internationally aligned implementation standards.',
    cert1Title: 'IICA (Inter-American Institute for Cooperation on Agriculture)',
    cert1Body: 'Impact validation in rural development and food security across the Andes.',
    cert2Title: 'MDC PUCV (UCURO Biotechnology Core - Chile)',
    cert2Body: 'Validation of dehydration processes and biotech efficiency applied to agribusiness.',
    ctaTitle: 'Want to learn more about our methodology and solutions?',
    ctaAction: 'Talk to an advisor →',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const copy = aboutCopy[getLocaleKey(params.locale)];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

const HERO_BG = '/images/sobre/sobre-hero.png';

const methodologyFronts = [
  {
    key: 'environmental',
    icon: Leaf,
    iconWrapper: 'bg-[#DBE8EF] text-[#3C6B80]',
  },
  {
    key: 'operational',
    icon: Cpu,
    iconWrapper: 'bg-[#DDECD4] text-[#74A954]',
  },
  {
    key: 'financial',
    icon: DollarSign,
    iconWrapper: 'bg-[#E6DCF0] text-[#6D5C9A]',
  },
  {
    key: 'training',
    icon: GraduationCap,
    iconWrapper: 'bg-[#DDEFD9] text-[#72A96C]',
  },
] as const;

export default async function SobrePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const copy = aboutCopy[locale];
  const layout = await getManagedPageLayout('sobre', searchParams, params.locale);
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
        {/* Hero section: imagem de fundo cheia com overlay */}
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
              {heroProps.title || copy.heroTitle}
            </h1>
            <p
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/95 sm:text-lg md:text-[19px] md:leading-[30px] md:tracking-[0px]"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {heroProps.subtitle || copy.heroSubtitle}
            </p>
            <div className="mt-7">
              <a
                href={heroProps.ctaUrl || '#soluciones'}
                className="inline-flex items-center justify-center rounded-xl bg-[#009179] px-7 py-3 text-sm font-bold leading-snug tracking-tight text-white shadow-lg shadow-black/20 transition hover:bg-[#007d6b] sm:text-base md:px-8 md:py-3 md:text-sm"
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

        <section data-editor-section="segments-section" className="bg-[#F1F4F6] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2
              className="mx-auto max-w-5xl text-center text-3xl font-bold leading-tight tracking-[-0.8px] text-[#20242E] sm:text-4xl"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              {copy.frontsTitle}
            </h2>

            <div className="mx-auto mt-14 grid max-w-5xl gap-x-14 gap-y-10 md:grid-cols-2">
              {methodologyFronts.map((item, index) => {
                const Icon = item.icon;
                const front = copy.fronts[index];
                return (
                  <article key={item.key} className="flex items-start gap-5">
                    <span
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${item.iconWrapper}`}
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-[26px] font-semibold leading-tight tracking-[-0.2px] text-[#20242E] sm:text-[28px]">
                        {front.title}
                      </h3>
                      <p className="mt-3 text-[19px] leading-relaxed text-[#3D4352] sm:text-[20px]">{front.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section data-editor-section="system-section" className="border-t border-[#E8E8E8] bg-[#F6F6F6] py-12 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div className="relative mx-auto h-[360px] w-full max-w-[360px]">
              <div className="absolute left-5 top-5 h-[210px] w-[230px] overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=85"
                  alt="Productores en campo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div
                className="absolute bottom-2 left-[58px] h-[134px] w-[145px] rounded-2xl border border-[#ECECEC] shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#f6f6f6 25%,#e8e8e8 25%,#e8e8e8 50%,#f6f6f6 50%,#f6f6f6 75%,#e8e8e8 75%,#e8e8e8 100%)',
                  backgroundSize: '16px 16px',
                }}
                aria-hidden
              />

              <div
                className="absolute right-3 top-[78px] h-[150px] w-[176px] rounded-2xl border border-[#ECECEC] shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#f6f6f6 25%,#e8e8e8 25%,#e8e8e8 50%,#f6f6f6 50%,#f6f6f6 75%,#e8e8e8 75%,#e8e8e8 100%)',
                  backgroundSize: '16px 16px',
                }}
                aria-hidden
              />
            </div>

            <div>
              <h2
                className="text-[36px] font-bold leading-[1.08] tracking-[-1px] text-[#161C2D] sm:text-[60px] sm:leading-[65px] sm:tracking-[-2px]"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                {copy.supportTitle}
              </h2>
              <p className="mt-3 text-[11px] text-[#1E1E1E]/70">
                {copy.supportTagline}
              </p>

              <div className="mt-8 space-y-5 text-[#1E1E1E]">
                <div>
                  <p className="text-sm font-bold">{copy.cert1Title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#1E1E1E]/80">
                    {copy.cert1Body}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">{copy.cert2Title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#1E1E1E]/80">
                    {copy.cert2Body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section data-editor-section="stats-section" className="bg-[#171E66] py-9 text-center text-white">
          <h3 className="mx-auto max-w-[760px] text-[28px] font-bold leading-tight tracking-[-0.01em] sm:text-[52px]">
            {copy.ctaTitle}
          </h3>
          <a
            href="mailto:contacto@ruralcommerce.com"
            className="mt-3 inline-block text-sm font-medium text-[#9DE4D3] underline underline-offset-4"
          >
            {copy.ctaAction}
          </a>
        </section>
        <LayoutBlocksRenderer blocks={layout?.blocks ?? []} locale={locale} />
      </main>

      <SiteFooter
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

