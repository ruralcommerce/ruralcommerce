import Link from 'next/link';

export type BlogFeaturedProps = {
  editorBlockId?: string;
  slug?: string;
  image?: string;
  category?: string;
  title?: string;
  excerpt?: string;
  author?: string;
  featuredImageAlt?: string;
  blogBasePath: string;
};

export function BlogFeaturedSection({
  editorBlockId,
  slug = '',
  image = '',
  category = '',
  title = '',
  excerpt = '',
  author = '',
  featuredImageAlt = '',
  blogBasePath,
}: BlogFeaturedProps) {
  const href = slug ? `${blogBasePath}/${slug}` : blogBasePath;

  return (
    <section
      data-editor-section="blog-featured"
      data-editor-block-id={editorBlockId}
      className="bg-white pt-16 pb-6 sm:pt-20 sm:pb-8"
    >
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10 lg:pt-14">
        <div className="flex flex-col items-start gap-12 lg:flex-row">
            <Link
              href={href}
              className="block h-[280px] w-full flex-shrink-0 overflow-hidden sm:h-[340px] lg:h-[380px] lg:w-3/5"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={featuredImageAlt || title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100" aria-hidden />
              )}
            </Link>
            <Link href={href} className="flex w-full flex-col lg:w-2/5">
              {category ? (
                <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">{category}</span>
              ) : null}
              {title ? (
                <h2 className="mb-4 text-2xl font-bold leading-tight text-[#181818] sm:text-3xl">{title}</h2>
              ) : null}
              {excerpt ? <p className="mb-6 text-sm text-gray-600">{excerpt}</p> : null}
              {author ? <span className="text-xs font-semibold text-gray-600">{author}</span> : null}
            </Link>
          </div>
      </div>
    </section>
  );
}

export type BlogPostCard = {
  slug: string;
  image: string;
  category: string;
  title: string;
  author: string;
};

export type BlogPostsGridProps = {
  editorBlockId?: string;
  posts: BlogPostCard[];
  blogBasePath: string;
};

export function BlogPostsGridSection({ editorBlockId, posts, blogBasePath }: BlogPostsGridProps) {
  return (
    <section
      data-editor-section="blog-posts-grid"
      data-editor-block-id={editorBlockId}
      className="bg-white pt-4 pb-16 sm:pt-6 sm:pb-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`${blogBasePath}/${post.slug}`} className="flex flex-col">
              <div className="mb-4 h-40 w-full overflow-hidden">
                {post.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-100" aria-hidden />
                )}
              </div>
              {post.category ? (
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">{post.category}</p>
              ) : null}
              {post.title ? (
                <h3 className="mb-3 text-sm font-bold leading-tight text-[#181818]">{post.title}</h3>
              ) : null}
              {post.author ? <p className="text-xs font-semibold text-gray-600">{post.author}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
