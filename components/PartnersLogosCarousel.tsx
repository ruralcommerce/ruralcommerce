'use client';

type Partner = {
  name: string;
  src: string;
  href: string;
  /** Fundo do círculo. Escuro = logos brancos (Incubacoop, IICA). */
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

function isDarkCircle(hex?: string): boolean {
  const raw = (hex || '').replace('#', '').trim();
  if (!raw) return false;
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (full.length !== 6) return false;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 150;
}

export function PartnersLogosCarousel({ partners = defaultPartners, locale = 'es' }: PartnersLogosCarouselProps) {
  return (
    <ul
      className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10"
      aria-label={partnersAriaByLocale[locale] || partnersAriaByLocale.es}
    >
      {partners.map((p) => {
        const dark = isDarkCircle(p.circle);
        const href = (p.href || '').trim();
        const hasLink = href.length > 0 && href !== '#';
        const className = `group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full shadow-[0_8px_24px_rgba(7,31,94,0.08)] ring-1 outline-none transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(7,31,94,0.14)] focus-visible:ring-2 focus-visible:ring-[#071F5E]/45 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-40 sm:w-40 ${
          dark ? 'ring-white/15 hover:ring-white/35' : 'bg-white ring-[#071F5E]/12 hover:ring-[#009179]/40'
        }`;
        const img = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src}
            alt=""
            width={160}
            height={160}
            className={`h-[82%] w-[82%] object-contain object-center transition-[filter,transform] duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.04] group-focus-visible:scale-[1.04] ${
              dark
                ? ''
                : '[filter:grayscale(1)_brightness(0.96)_saturate(0.45)_opacity(0.9)] group-hover:[filter:none] group-focus-visible:[filter:none]'
            }`}
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
