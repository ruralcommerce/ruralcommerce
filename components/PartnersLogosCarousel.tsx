'use client';

type Partner = {
  name: string;
  src: string;
  href: string;
  /** Optional circle fill. Default is white so grayscale works on every mark. */
  circle?: string;
};

const defaultPartners: Partner[] = [
  { name: 'Slack', src: 'https://cdn.simpleicons.org/slack', href: 'https://slack.com' },
  { name: 'Commerce', src: 'https://cdn.simpleicons.org/shopify', href: 'https://www.shopify.com' },
  { name: 'Medium', src: 'https://cdn.simpleicons.org/medium', href: 'https://medium.com' },
  { name: 'SitePoint', src: 'https://cdn.simpleicons.org/sitepoint', href: 'https://www.sitepoint.com' },
  { name: 'Microsoft', src: 'https://cdn.simpleicons.org/microsoft', href: 'https://www.microsoft.com' },
  { name: 'GitHub', src: 'https://cdn.simpleicons.org/github', href: 'https://github.com' },
];

export type PartnersLogosCarouselProps = {
  partners?: Partner[];
  locale?: string;
};

const partnersAriaByLocale: Record<string, string> = {
  es: 'Logos de socios',
  'pt-BR': 'Logotipos de parceiros',
  en: 'Partner logos',
};

export function PartnersLogosCarousel({ partners = defaultPartners, locale = 'es' }: PartnersLogosCarouselProps) {
  return (
    <ul
      className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10"
      aria-label={partnersAriaByLocale[locale] || partnersAriaByLocale.es}
    >
      {partners.map((p) => {
        const href = (p.href || '').trim();
        const hasLink = href.length > 0 && href !== '#';
        const className =
          'group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(7,31,94,0.08)] ring-1 ring-[#071F5E]/12 outline-none transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(7,31,94,0.14)] hover:ring-[#009179]/40 focus-visible:ring-2 focus-visible:ring-[#071F5E]/45 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-40 sm:w-40';
        const img = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src}
            alt=""
            width={160}
            height={160}
            className="h-[84%] w-[84%] object-contain object-center transition-[filter,transform] duration-300 ease-out [filter:grayscale(1)_brightness(0.92)_saturate(0)_opacity(0.88)] motion-reduce:transition-none group-hover:scale-[1.04] group-hover:[filter:none] group-focus-visible:scale-[1.04] group-focus-visible:[filter:none]"
            loading="lazy"
            decoding="async"
          />
        );
        const style = { backgroundColor: p.circle || '#ffffff' };
        return (
          <li key={`${p.name}-${p.href || p.src}`}>
            {hasLink ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.name}
                className={className}
                style={style}
              >
                {img}
              </a>
            ) : (
              <div aria-label={p.name} className={className} style={style}>
                {img}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
