import type { Metadata } from 'next';
import { BlogFeaturedSection, BlogPostsGridSection } from '@/components/BlogPageBlocks';
import { blogMeta, getBlogLocaleKey } from '@/lib/blog-defaults';
import { getBlogPostsForLocale, pickFeaturedPost, postsToCards } from '@/lib/blog-posts';
import { LayoutSearchParams } from '@/lib/page-layout-runtime';
import { loadBlogSiteChrome } from '@/lib/blog-site-chrome';

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
  const posts = await getBlogPostsForLocale(localeKey);
  const featured = pickFeaturedPost(posts);
  const cards = postsToCards(posts);
  const { header, footer } = await loadBlogSiteChrome(params.locale, searchParams);

  const emptyCopy =
    localeKey === 'pt-BR'
      ? 'Sem artigos publicados no momento.'
      : localeKey === 'en'
        ? 'No articles published at the moment.'
        : 'No hay artículos publicados en este momento.';

  if (!featured) {
    return (
      <div className="flex min-h-screen flex-col">
        {header}
        <main className="flex-1 bg-white pt-24 sm:pt-28">
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <p className="text-sm text-[#3D4352]">{emptyCopy}</p>
          </section>
        </main>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {header}

      <main>
        <BlogFeaturedSection
          blogBasePath={blogBasePath}
          slug={featured.slug}
          image={featured.coverImage}
          category={featured.category}
          title={featured.title}
          excerpt={featured.excerpt}
          author={featured.author}
          featuredImageAlt={featured.coverImageAlt || blogMeta[localeKey].featuredImageAlt}
        />

        <BlogPostsGridSection blogBasePath={blogBasePath} posts={cards} />
      </main>

      {footer}
    </div>
  );
}
