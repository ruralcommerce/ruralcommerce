import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { BlogFeaturedSection, BlogPostsGridSection, type BlogPostCard } from '@/components/BlogPageBlocks';
import { blogMeta, getBlogDefaultBlocks, getBlogLocaleKey } from '@/lib/blog-defaults';
import {
  getBlockIdByType,
  getBlockProps,
  getManagedPageLayout,
  LayoutSearchParams,
  parseJsonArray,
} from '@/lib/page-layout-runtime';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import type { Metadata } from 'next';

const fallbackNav = {
  es: [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluciones', href: '/solucoes' },
    { label: 'Aliados e Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '/contacto' },
  ],
  'pt-BR': [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Aliados e Investidores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '/contacto' },
  ],
  en: [
    { label: 'About', href: '/sobre' },
    { label: 'Solutions', href: '/solucoes' },
    { label: 'Partners & Investors', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contacto' },
  ],
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const meta = blogMeta[getBlogLocaleKey(params.locale)];
  return {
    title: meta.metadataTitle,
    description: meta.metadataDescription,
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const localeKey = getBlogLocaleKey(params.locale);
  const blogBasePath = `/${params.locale}/blog`;
  const layout = await getManagedPageLayout('blog', searchParams, params.locale);
  const defaults = getBlogDefaultBlocks(localeKey);
  const defaultFeatured = defaults.find((b) => b.type === 'blog-featured')?.props ?? {};
  const defaultGrid = defaults.find((b) => b.type === 'blog-posts-grid')?.props ?? {};

  const featuredProps = {
    ...BLOCK_LIBRARY['blog-featured'].defaultProps,
    ...defaultFeatured,
    ...getBlockProps(layout, 'blog-featured'),
  };
  const gridProps = {
    ...BLOCK_LIBRARY['blog-posts-grid'].defaultProps,
    ...defaultGrid,
    ...getBlockProps(layout, 'blog-posts-grid'),
  };
  const posts = parseJsonArray<BlogPostCard>(gridProps.postsJson, []);

  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    [...fallbackNav[localeKey]]
  );
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(
    footerProps.footerLinksJson,
    []
  );
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main>
        <BlogFeaturedSection
          editorBlockId={getBlockIdByType(layout, 'blog-featured')}
          blogBasePath={blogBasePath}
          slug={String(featuredProps.slug || '')}
          image={String(featuredProps.image || '')}
          category={String(featuredProps.category || '')}
          title={String(featuredProps.title || '')}
          excerpt={String(featuredProps.excerpt || '')}
          author={String(featuredProps.author || '')}
          featuredImageAlt={String(featuredProps.featuredImageAlt || blogMeta[localeKey].featuredImageAlt)}
        />
        <BlogPostsGridSection
          editorBlockId={getBlockIdByType(layout, 'blog-posts-grid')}
          blogBasePath={blogBasePath}
          posts={posts}
        />
      </main>

      <RuralCommerceFooter
        title={String(footerProps.title || 'Rural Commerce')}
        copyright={String(
          footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`
        )}
        contactTitle={String(footerProps.contactTitle || 'Contacto')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay - dirección comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 - - - - -')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociales')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
        locale={params.locale}
      />
    </div>
  );
}
