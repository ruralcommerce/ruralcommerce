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
import { defaultProjectHeaderNav, getProjectLocaleKey } from '@/lib/project-locale';

export async function loadBlogSiteChrome(localeParam: string, searchParams?: LayoutSearchParams) {
  const localeKey = getProjectLocaleKey(localeParam);
  const siteLayout = await getManagedPageLayout('homepage', searchParams, localeParam);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(
    headerProps.navItemsJson,
    [...defaultProjectHeaderNav[localeKey]]
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
    copyright: String(footerProps.copyright || ''),
    contactTitle: String(footerProps.contactTitle || ''),
    contactAddress: String(footerProps.contactAddress || ''),
    contactPhone: String(footerProps.contactPhone || ''),
    contactEmail: String(footerProps.contactEmail || 'contacto@ruralcommerce.com'),
    socialLabel: String(footerProps.socialLabel || ''),
    footerLinks,
    socialLinks,
    locale: localeParam,
  });

  return { header, footer };
}
