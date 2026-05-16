import { BlogFeaturedSection, BlogPostsGridSection } from '@/components/BlogPageBlocks';
import { blogMeta, getBlogLocaleKey } from '@/lib/blog-defaults';
import { getBlogPostsForLocale, pickFeaturedPost, postsToCards } from '@/lib/blog-posts';
import { loadBlogSiteChrome } from '@/lib/blog-site-chrome';
import { getBlockIdByType, getBlockProps, getManagedPageLayout, LayoutSearchParams } from '@/lib/page-layout-runtime';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import type { Metadata } from 'next';

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
  const storedPosts = await getBlogPostsForLocale(params.locale);
  const featuredPost = pickFeaturedPost(storedPosts);
  const posts = postsToCards(storedPosts);

  const featuredProps =
    featuredPost != null
      ? {
          slug: featuredPost.slug,
          image: featuredPost.coverImage,
          category: featuredPost.category,
          title: featuredPost.title,
          excerpt: featuredPost.excerpt,
          author: featuredPost.author,
          featuredImageAlt: featuredPost.coverImageAlt || blogMeta[localeKey].featuredImageAlt,
        }
      : {
          ...BLOCK_LIBRARY['blog-featured'].defaultProps,
          ...getBlockProps(layout, 'blog-featured'),
        };

  const { header, footer } = await loadBlogSiteChrome(params.locale, searchParams);

  return (
    <div className="flex min-h-screen flex-col">
      {header}

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
          featuredImageAlt={String(
            featuredPost != null
              ? featuredPost.coverImageAlt || blogMeta[localeKey].featuredImageAlt
              : (featuredProps as { featuredImageAlt?: string }).featuredImageAlt ||
                  blogMeta[localeKey].featuredImageAlt
          )}
        />
        <BlogPostsGridSection
          editorBlockId={getBlockIdByType(layout, 'blog-posts-grid')}
          blogBasePath={blogBasePath}
          posts={posts}
        />
      </main>

      {footer}
    </div>
  );
}
