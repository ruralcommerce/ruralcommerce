import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogMediaCarousel } from '@/components/BlogMediaCarousel';
import { getBlogLocaleKey, blogMeta } from '@/lib/blog-defaults';
import { getBlogPostBySlug } from '@/lib/blog-posts';
import { normalizeBlogBodyToHtml, resolveBlogCtaHref } from '@/lib/blog-html';
import { loadBlogSiteChrome } from '@/lib/blog-site-chrome';
import type { LayoutSearchParams } from '@/lib/page-layout-runtime';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const notFoundTitle: Record<LocaleKey, string> = {
  es: 'Artículo no encontrado',
  'pt-BR': 'Artigo não encontrado',
  en: 'Article not found',
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const localeKey = getBlogLocaleKey(params.locale);
  const post = await getBlogPostBySlug(params.locale, params.slug);
  if (!post) {
    return { title: `${notFoundTitle[getLocaleKey(params.locale)]} — Rural Commerce` };
  }
  const description = post.excerpt?.trim() || blogMeta[localeKey].metadataDescription;
  return {
    title: `${post.title} — Rural Commerce`,
    description,
  };
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams?: LayoutSearchParams;
}) {
  const localeKey = getLocaleKey(params.locale);
  const post = await getBlogPostBySlug(params.locale, params.slug);

  if (!post) {
    notFound();
  }

  const { header, footer } = await loadBlogSiteChrome(params.locale, searchParams);
  const bodyHtml = normalizeBlogBodyToHtml(post.body);
  const carouselItems =
    post.gallery && post.gallery.length > 0
      ? post.gallery
      : [{ type: 'image' as const, src: post.coverImage, alt: post.coverImageAlt || post.title }];

  const cta = post.cta;
  const showCta =
    Boolean(cta?.enabled) && Boolean(cta?.title || cta?.body || cta?.buttonLabel || cta?.buttonHref);
  const ctaHref = resolveBlogCtaHref(cta?.buttonHref, params.locale);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {header}

      <main className="flex-1 pt-28 sm:pt-32">
        <article className="pb-8 sm:pb-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
              <div className="order-1 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{post.category}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-[#181818] sm:text-4xl">{post.title}</h1>
                <p className="mt-4 text-xs font-semibold text-gray-600">{post.author}</p>
                {post.excerpt ? (
                  <p
                    className="mt-6 text-base leading-relaxed text-[#3D4352]"
                    style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                  >
                    {post.excerpt}
                  </p>
                ) : null}
              </div>

              <div className="order-3 lg:order-2 lg:col-span-3">
                <BlogMediaCarousel items={carouselItems} title={post.title} locale={localeKey} />
              </div>

              {bodyHtml ? (
                <div
                  className="order-2 lg:order-3 lg:col-span-5 mt-2 max-w-none text-base leading-relaxed text-[#3D4352] md:columns-2 [&_a]:text-[#009179] [&_a]:underline [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_h2]:break-after-avoid [&_h3]:break-after-avoid"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : null}
            </div>
          </div>

          {showCta && cta ? (
            <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
              <aside className="rounded-2xl border border-[#071F5E]/15 bg-gradient-to-br from-[#E8F7F4] to-[#f0f4fa] px-6 py-8 shadow-sm sm:px-10 sm:py-10">
                {cta.title ? (
                  <h2 className="text-xl font-bold tracking-tight text-[#071F5E] sm:text-2xl">{cta.title}</h2>
                ) : null}
                {cta.body ? (
                  <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#3D4352] sm:text-base">
                    {cta.body}
                  </p>
                ) : null}
                <div className="mt-6">
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center justify-center rounded-lg bg-[#009179] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007a66]"
                  >
                    {cta.buttonLabel?.trim() || 'Contacto'}
                  </Link>
                </div>
              </aside>
            </div>
          ) : null}
        </article>
      </main>

      {footer}
    </div>
  );
}
