import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter as SiteFooter } from '@/components/RuralCommerceFooter';
import { ContactFormSplit, ContactHeroSplit, ContactSocialStrip } from '@/components/ContactPageBlocks';
import { LayoutBlocksRenderer } from '@/components/LayoutBlocksRenderer';
import {
  getBlockIdByType,
  getBlockProps,
  getManagedPageLayout,
  LayoutSearchParams,
  parseJsonArray,
} from '@/lib/page-layout-runtime';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import type { Metadata } from 'next';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const meta = {
  es: { title: 'Contacto — Rural Commerce', description: 'Hable con nuestro equipo y conozca el próximo paso hacia la rentabilidad.' },
  'pt-BR': { title: 'Contato — Rural Commerce', description: 'Fale com nossa equipe e conheça o próximo passo rumo à rentabilidade.' },
  en: { title: 'Contact — Rural Commerce', description: 'Talk to our team and learn the next step toward profitability.' },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const m = meta[getLocaleKey(params.locale)];
  return { title: m.title, description: m.description };
}

export default async function ContactoPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const layout = await getManagedPageLayout('contacto', searchParams, params.locale);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);

  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');

  const fallbackNav = [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluciones', href: '/solucoes' },
    { label: 'Aliados e Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '/contacto' },
  ];
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    locale === 'pt-BR'
      ? fallbackNav.map((n, i) =>
          i === 1
            ? { label: 'Soluções', href: n.href }
            : i === 4
              ? { label: 'Contato', href: n.href }
              : n
        )
      : locale === 'en'
        ? [
            { label: 'About', href: '/sobre' },
            { label: 'Solutions', href: '/solucoes' },
            { label: 'Partners & Investors', href: '/aliados' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contact', href: '/contacto' },
          ]
        : fallbackNav
  );

  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    []
  );
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  const hero = {
    ...BLOCK_LIBRARY['contact-hero-split'].defaultProps,
    ...getBlockProps(layout, 'contact-hero-split'),
  };
  const form = {
    ...BLOCK_LIBRARY['contact-form-split'].defaultProps,
    ...getBlockProps(layout, 'contact-form-split'),
  };
  const social = {
    ...BLOCK_LIBRARY['contact-social-strip'].defaultProps,
    ...getBlockProps(layout, 'contact-social-strip'),
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />
      <main className="flex-1">
        <ContactHeroSplit editorBlockId={getBlockIdByType(layout, 'contact-hero-split')} {...hero} />
        <ContactFormSplit editorBlockId={getBlockIdByType(layout, 'contact-form-split')} {...form} />
        <ContactSocialStrip editorBlockId={getBlockIdByType(layout, 'contact-social-strip')} {...social} />
        <LayoutBlocksRenderer blocks={layout?.blocks ?? []} locale={locale} />
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
        socialLinks={socialLinks}
      />
    </div>
  );
}
