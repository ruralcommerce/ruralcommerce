import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogMediaCarousel } from '@/components/BlogMediaCarousel';
import { getBlogLocaleKey } from '@/lib/blog-defaults';
import { getBlogPostBySlug } from '@/lib/blog-posts';
import { normalizeBlogBodyToHtml, resolveBlogCtaHref } from '@/lib/blog-html';
import { LayoutSearchParams } from '@/lib/page-layout-runtime';
import { loadBlogSiteChrome } from '@/lib/blog-site-chrome';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const localeKey = getBlogLocaleKey(params.locale);
  const post = await getBlogPostBySlug(localeKey, params.slug);

  if (!post) {
    return { title: 'Blog - Rural Commerce' };
  }

  return {
    title: `${post.title} - Rural Commerce`,
    description: post.excerpt || post.title,
  };
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams?: LayoutSearchParams;
}) {
  const localeKey = getBlogLocaleKey(params.locale);
  const post = await getBlogPostBySlug(localeKey, params.slug);

  if (!post) {
    notFound();
  }

  const { header, footer } = await loadBlogSiteChrome(params.locale, searchParams);
  const bodyHtml = normalizeBlogBodyToHtml(post.body || '');
  const mediaItems =
    post.gallery && post.gallery.length > 0
      ? post.gallery
      : [{ type: 'image' as const, src: post.coverImage, alt: post.coverImageAlt || post.title }];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {header}

      <main className="flex-1 pt-28 sm:pt-32">
        <section className="pb-16 sm:pb-20">
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
                <BlogMediaCarousel items={mediaItems} title={post.title} locale={localeKey} />
              </div>

              <div className="order-2 mt-2 lg:order-3 lg:col-span-5">
                <article
                  className="prose prose-slate max-w-none text-[#3D4352] prose-headings:text-[#181818] prose-a:text-[#1D6359]"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
            </div>

            {post.cta?.enabled ? (
              <aside className="mt-10 rounded-3xl border border-[#E6EBF1] bg-[#F6FAFA] p-5 sm:p-6">
                {post.cta.title ? <h2 className="text-lg font-semibold text-[#071F5E]">{post.cta.title}</h2> : null}
                {post.cta.body ? <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{post.cta.body}</p> : null}
                {post.cta.buttonLabel ? (
                  <Link
                    href={resolveBlogCtaHref(post.cta.buttonHref, params.locale)}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E] transition hover:bg-[#6CC7C7]"
                  >
                    {post.cta.buttonLabel}
                  </Link>
                ) : null}
              </aside>
            ) : null}
          </div>
        </section>
      </main>

      {footer}
    </div>
  );
}
