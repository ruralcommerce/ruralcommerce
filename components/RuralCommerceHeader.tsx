'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
  { href: '/solucoes', label: 'Soluções' },
  { href: '/aliados', label: 'Aliados e Inversores' },
  { href: '/blog', label: 'Blog' },
  { href: '#contacto', label: 'Contato' },
] as const;

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
  const pathname = usePathname();
  const isSobrePage = pathname === '/sobre';

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero && !isSobrePage) {
      setSolidNav(true);
      return;
    }

    const onScroll = () => {
      if (!hero) {
        setSolidNav(false);
        return;
      }
      const h = hero.offsetHeight;
      const y = window.scrollY;
      setSolidNav(y > Math.max(h - 88, 96));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isSobrePage]);

  const overlay = !solidNav;

  return (
    <header
      data-editor-section="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overlay
          ? 'border-transparent bg-transparent text-white'
          : 'bg-white text-[#071F5E] backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex items-center" aria-label="Rural Commerce — início">
          <LogoMark className="h-11 w-auto object-contain drop-shadow-sm sm:h-12" alt={logoAlt} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-2 text-[13px] font-semibold transition sm:px-3 ${
                overlay
                  ? 'text-white/95 hover:bg-white/10 hover:text-white'
                  : 'text-[#1E1E1E]/85 hover:bg-[#071F5E]/5 hover:text-[#071F5E]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={`inline-flex rounded-lg p-2 lg:hidden ${overlay ? 'text-white' : 'text-[#071F5E]'}`}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
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
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${overlay ? 'text-white' : 'text-[#071F5E]'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
