import { createElement } from 'react';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import {
  getBlockProps,
  getManagedPageLayout,
  LayoutSearchParams,
  parseJsonArray,
} from '@/lib/page-layout-runtime';
import { parseSocialLinksJsonWithFallback } from '@/lib/social-links';

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

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export async function loadBlogSiteChrome(localeParam: string, searchParams?: LayoutSearchParams) {
  const localeKey = getLocaleKey(localeParam);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, localeParam);
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
  const socialLinks = parseSocialLinksJsonWithFallback(footerProps.socialLinksJson, []);

  const header = createElement(RuralCommerceHeader, {
    navItems: headerNavItems,
    logoAlt: String(headerProps.logoAlt || 'Rural Commerce Logo'),
  });

  const footer = createElement(RuralCommerceFooter, {
    title: String(footerProps.title || 'Rural Commerce'),
    copyright: String(
      footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`
    ),
    contactTitle: String(footerProps.contactTitle || 'Contacto'),
    contactAddress: String(footerProps.contactAddress || 'Uruguay - dirección comercial (completar)'),
    contactPhone: String(footerProps.contactPhone || '+598 - - - - -'),
    contactEmail: String(footerProps.contactEmail || 'contacto@ruralcommerce.com'),
    socialLabel: String(footerProps.socialLabel || 'Redes sociales'),
    footerLinks,
    socialLinks,
    locale: localeParam,
  });

  return { header, footer };
}
