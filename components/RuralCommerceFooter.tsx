import Image from 'next/image';
import { SocialLinkIcon } from '@/components/SocialLinkIcon';

type FooterLinkItem = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  group: string;
  items: FooterLinkItem[];
};

type FooterSocialLink = {
  label: string;
  href: string;
};

type RuralCommerceFooterProps = {
  locale?: string;
  title?: string;
  copyright?: string;
  contactTitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLabel?: string;
  footerLinks?: FooterLinkGroup[];
  socialLinks?: FooterSocialLink[];
};

const defaultFooterLinks: FooterLinkGroup[] = [
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
      { label: 'Historia y proposito', href: '/sobre' },
      { label: 'Como funciona', href: '/#sistema' },
      { label: 'Socios', href: '/#socios' },
    ],
  },
];

const defaultSocialLinks: FooterSocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
];

function getDefaultFooterLinks(locale: string): FooterLinkGroup[] {
  if (locale === 'pt-BR') {
    return [
      {
        group: 'Outra secao',
        items: [
          { label: 'Inicio', href: '/#hero' },
          { label: 'Solucoes', href: '/#soluciones' },
          { label: 'Segmentos', href: '/#segmentos' },
        ],
      },
      {
        group: 'Sobre',
        items: [
          { label: 'Historia e proposito', href: '/sobre' },
          { label: 'Como funciona', href: '/#sistema' },
          { label: 'Parceiros', href: '/#socios' },
        ],
      },
    ];
  }

  if (locale === 'en') {
    return [
      {
        group: 'Other section',
        items: [
          { label: 'Home', href: '/#hero' },
          { label: 'Solutions', href: '/#soluciones' },
          { label: 'Segments', href: '/#segmentos' },
        ],
      },
      {
        group: 'About',
        items: [
          { label: 'History and purpose', href: '/sobre' },
          { label: 'How it works', href: '/#sistema' },
          { label: 'Partners', href: '/#socios' },
        ],
      },
    ];
  }

  return defaultFooterLinks;
}

function localizeHref(href: string, locale: string): string {
  if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }

  if (!href.startsWith('/')) {
    return href;
  }

  const stripped = href.replace(/^\/(es|pt-BR|en)(?=\/|#|$)/, '');
  const normalizedHref = stripped.length > 0 ? stripped : '/';

  if (normalizedHref.startsWith(`/${locale}`)) {
    return normalizedHref;
  }

  if (normalizedHref.startsWith('/#')) {
    return `/${locale}${normalizedHref.slice(1)}`;
  }

  if (normalizedHref === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedHref}`;
}

export function RuralCommerceFooter({
  locale = 'es',
  title = 'Rural Commerce',
  copyright = `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`,
  contactTitle = 'Contacto',
  contactAddress = 'Uruguay - direccion comercial (completar)',
  contactPhone = '+598 · · · · ·',
  contactEmail = 'contacto@ruralcommerce.com',
  socialLabel = 'Redes sociales',
  footerLinks,
  socialLinks = defaultSocialLinks,
}: RuralCommerceFooterProps) {
  const resolvedFooterLinks = footerLinks && footerLinks.length > 0 ? footerLinks : getDefaultFooterLinks(locale);

  return (
    <footer data-editor-section="site-footer" className="border-t border-[#071F5E]/10 bg-white text-[#1E1E1E]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <div className="inline-flex items-center">
              <Image
                src="/images/logo.png"
                alt={title}
                width={220}
                height={64}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="sr-only">{socialLabel}</p>
            <div className="mt-5 flex items-center gap-4 text-[#071F5E]">
              {socialLinks
                .filter((link) => link.href.trim())
                .map((link) => (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[#009179]"
                    aria-label={link.label}
                  >
                    <SocialLinkIcon label={link.label} className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{resolvedFooterLinks[0]?.group || getDefaultFooterLinks(locale)[0].group}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {(resolvedFooterLinks[0]?.items || []).map((item) => (
                <li key={item.label}>
                  <a href={localizeHref(item.href, locale)} className="transition hover:text-[#009179]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{resolvedFooterLinks[1]?.group || getDefaultFooterLinks(locale)[1].group}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {(resolvedFooterLinks[1]?.items || []).map((item) => (
                <li key={item.label}>
                  <a href={localizeHref(item.href, locale)} className="transition hover:text-[#009179]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{contactTitle}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>{contactAddress}</li>
              <li>
                <span className="text-[#1E1E1E]/80">WhatsApp / tel.:</span> {contactPhone}
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-medium text-[#009179] underline-offset-2 transition hover:underline"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 text-center text-sm font-bold text-[#009179]">
          {copyright}
        </p>
      </div>
    </footer>
  );
}

