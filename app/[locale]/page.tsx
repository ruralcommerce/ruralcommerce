import { promises as fs } from 'fs';
import path from 'path';
import { HomeMainBlocks } from '@/components/home/HomeMainBlocks';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import type { BlockType, PageSchema } from '@/lib/editor-types';
import { reconcilePageBlocks } from '@/lib/editor-pages';
import { createBlock } from '@/lib/editor-utils';
import { getBlockProps, parseJsonArray } from '@/lib/page-layout-runtime';
import { parseSocialLinksJsonWithFallback } from '@/lib/social-links';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');

function sanitizeLayoutJson(raw: string): string {
  return raw.replace(/^\uFEFF/, '');
}

const DEFAULT_SECTION_ORDER: BlockType[] = [
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

const systemHeadingByLocale: Record<string, string> = {
  es: 'Un sistema completo para transformar la producción rural',
  'pt-BR': 'Um sistema completo para transformar a produção rural',
  en: 'A complete system to transform rural production',
};

async function getHomepageLayout(locale: string, searchParams?: HomeSearchParams): Promise<PageSchema | null> {
  const candidates = [`homepage.${locale}.json`, 'homepage.json'];
  try {
    let layout: PageSchema | null = null;

    for (const file of candidates) {
      try {
        const content = await fs.readFile(path.join(LAYOUTS_DIR, file), 'utf-8');
        layout = JSON.parse(sanitizeLayoutJson(content)) as PageSchema;
        break;
      } catch (error: any) {
        if (error?.code === 'ENOENT') {
          continue;
        }
        throw error;
      }
    }

    if (!layout) return null;

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

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: HomeSearchParams;
}) {
  const publishedLayout = await getHomepageLayout(params.locale, searchParams);

  const reconciled = publishedLayout
    ? reconcilePageBlocks('homepage', publishedLayout.blocks)
    : DEFAULT_SECTION_ORDER.map((t) => createBlock(t));

  const mainBlocks = reconciled.filter((b) => b.type !== 'site-header' && b.type !== 'site-footer');

  const headerProps = getBlockProps(publishedLayout, 'site-header');
  const footerProps = getBlockProps(publishedLayout, 'site-footer');

  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados y Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '/contacto' },
    ]
  );

  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    [
      {
        group: 'Otra seccion',
        items: [
          { label: 'Inicio', href: '/#hero' },
          { label: 'Soluciones', href: '/#soluciones' },
          { label: 'Segmentos', href: '/#segmentos' },
        ],
      },
      {
        group: 'Sobre',
        items: [
          { label: 'Historia y propósito', href: '/sobre' },
          { label: 'Como funciona', href: '/#sistema' },
          { label: 'Socios', href: '/#socios' },
        ],
      },
    ]
  );

  const socialLinks = parseSocialLinksJsonWithFallback(footerProps.socialLinksJson, [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main className="flex flex-col">
        <HomeMainBlocks
          blocks={mainBlocks}
          locale={params.locale}
          systemHeading={systemHeadingByLocale[params.locale] || systemHeadingByLocale.es}
        />
      </main>

      <RuralCommerceFooter
        locale={params.locale}
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
