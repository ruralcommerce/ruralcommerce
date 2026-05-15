'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SUPPORTED_LOCALES = ['es', 'pt-BR', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type HeaderNavItem = {
  href: string;
  label: string;
};

type RuralCommerceHeaderProps = {
  navItems?: HeaderNavItem[];
  logoAlt?: string;
};

const defaultNav = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/solucoes', label: 'Soluciones' },
  { href: '/aliados', label: 'Aliados y Inversores' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
] as const;

/** Só mostra o header com scroll no topo da página */
const HEADER_VISIBLE_SCROLL_PX = 56;

const headerA11yByLocale: Record<SupportedLocale, { home: string; openMenu: string; closeMenu: string }> = {
  es: {
    home: 'Rural Commerce - inicio',
    openMenu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
  },
  'pt-BR': {
    home: 'Rural Commerce - inicio',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
  },
  en: {
    home: 'Rural Commerce - home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
};

function stripLocalePrefix(pathname: string): string {
  const pattern = /^\/(es|pt-BR|en)(?=\/|$)/;
  const stripped = pathname.replace(pattern, '');
  return stripped.length > 0 ? stripped : '/';
}

function detectLocale(pathname: string): SupportedLocale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return (SUPPORTED_LOCALES.find((locale) => locale === firstSegment) ?? 'es') as SupportedLocale;
}

function buildLocalePath(locale: SupportedLocale, pathname: string): string {
  const basePath = stripLocalePrefix(pathname);
  const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

function localizeHref(href: string, locale: SupportedLocale): string {
  if (!href.startsWith('/')) return href;
  if (/^\/(es|pt-BR|en)(\/|$)/.test(href)) return href;
  return `/${locale}${href === '/' ? '' : href}`;
}

/** Item ativo: mesma rota ou sub-rota (ex.: /blog/slug → Blog). */
function isNavItemActive(strippedPath: string, itemHref: string): boolean {
  if (!itemHref || itemHref === '/') {
    return strippedPath === '/' || strippedPath === '';
  }
  if (strippedPath === itemHref) return true;
  return strippedPath.startsWith(`${itemHref}/`);
}

function LogoMark({ className, alt }: { className?: string; alt: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt={alt}
      width={220}
      height={64}
      className={className}
      priority
    />
  );
}

export function RuralCommerceHeader({ navItems = [...defaultNav], logoAlt = 'Rural Commerce Logo' }: RuralCommerceHeaderProps) {
  const [open, setOpen] = useState(false);
  const [solidNav, setSolidNav] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const a11y = headerA11yByLocale[locale];
  const strippedPath = stripLocalePrefix(pathname);
  const isSobrePage = strippedPath === '/sobre';
  const localizedHomeHref = `/${locale}`;

  useEffect(() => {
    const hero = document.getElementById('hero');

    const update = () => {
      const y = window.scrollY;
      const top = y <= HEADER_VISIBLE_SCROLL_PX;
      setAtTop(top);
      if (!top) setOpen(false);

      if (!hero && !isSobrePage) {
        setSolidNav(true);
      } else if (hero) {
        const h = hero.offsetHeight;
        setSolidNav(y > Math.max(h - 88, 96));
      } else {
        setSolidNav(false);
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isSobrePage, pathname]);

  const overlay = !solidNav;
  const headerVisible = atTop;

  return (
    <header
      data-editor-section="site-header"
      aria-hidden={!headerVisible}
      className={`fixed left-0 right-0 top-0 z-[100] transition-[transform,opacity,background-color,border-color,color] duration-300 ease-out will-change-transform ${
        headerVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      } ${
        overlay
          ? 'border-transparent bg-transparent text-white'
          : 'border-b border-slate-200/80 bg-white/95 text-[#071F5E] backdrop-blur-md supports-[backdrop-filter]:bg-white/80'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={localizedHomeHref} className="inline-flex items-center" aria-label={a11y.home}>
          <LogoMark className="h-11 w-auto object-contain drop-shadow-sm sm:h-12" alt={logoAlt} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const active = isNavItemActive(strippedPath, item.href);
            return (
            <a
              key={item.href}
              href={localizeHref(item.href, locale)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-2.5 py-2 text-[13px] font-semibold transition sm:px-3 ${
                active
                  ? 'bg-[#009179] text-white hover:bg-[#007d6b]'
                  : overlay
                    ? 'text-white/95 hover:bg-white/10 hover:text-white'
                    : 'text-[#1E1E1E]/85 hover:bg-[#071F5E]/5 hover:text-[#071F5E]'
              }`}
            >
              {item.label}
            </a>
            );
          })}
          <div className={`ml-2 flex items-center gap-1 rounded-lg border px-1 py-1 ${
            overlay ? 'border-white/30 bg-white/10' : 'border-[#071F5E]/20 bg-white'
          }`}>
            {SUPPORTED_LOCALES.map((lang) => (
              <Link
                key={lang}
                href={buildLocalePath(lang, pathname)}
                className={`rounded px-2 py-1 text-[11px] font-semibold uppercase transition ${
                  locale === lang
                    ? overlay
                      ? 'bg-white text-[#071F5E]'
                      : 'bg-[#071F5E] text-white'
                    : overlay
                      ? 'text-white/90 hover:bg-white/15'
                      : 'text-[#071F5E] hover:bg-[#071F5E]/10'
                }`}
              >
                {lang === 'pt-BR' ? 'PT' : lang.toUpperCase()}
              </Link>
            ))}
          </div>
        </nav>

        <button
          type="button"
          className={`inline-flex rounded-lg p-2 lg:hidden ${overlay ? 'text-white' : 'text-[#071F5E]'}`}
          aria-label={open ? a11y.closeMenu : a11y.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div
          className={`border-t px-4 py-4 lg:hidden ${
            overlay ? 'border-white/15 bg-[#071F5E]/95 text-white backdrop-blur-md' : 'border-[#071F5E]/10 bg-[#F2F2F2]'
          }`}
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isNavItemActive(strippedPath, item.href);
              return (
              <a
                key={item.href}
                href={localizeHref(item.href, locale)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#009179] text-white hover:bg-[#007d6b]'
                    : overlay
                      ? 'text-white'
                      : 'text-[#071F5E]'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
              );
            })}
            <div className="mt-2 flex items-center gap-2 px-1">
              {SUPPORTED_LOCALES.map((lang) => (
                <Link
                  key={lang}
                  href={buildLocalePath(lang, pathname)}
                  className={`rounded px-2 py-1 text-xs font-semibold uppercase ${
                    locale === lang
                      ? 'bg-[#071F5E] text-white'
                      : overlay
                        ? 'border border-white/30 text-white'
                        : 'border border-[#071F5E]/30 text-[#071F5E]'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {lang === 'pt-BR' ? 'PT' : lang.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
