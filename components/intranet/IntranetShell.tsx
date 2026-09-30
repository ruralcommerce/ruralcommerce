'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  Wrench,
  LogOut,
  BookOpen,
} from 'lucide-react';
import type { IntranetPermission, IntranetSession } from '@/lib/intranet/types';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: IntranetPermission;
};

function navItems(locale: string): NavItem[] {
  const base = `/${locale}/intranet`;
  return [
    { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { href: `${base}/usuarios`, label: 'Usuarios', icon: Users, permission: 'users.manage' },
    { href: `${base}/colaboradores`, label: 'Colaboradores', icon: UserCog, permission: 'collaborators.manage' },
    { href: `${base}/permisos`, label: 'Permisos', icon: Shield, permission: 'permissions.manage' },
    { href: `${base}/herramientas`, label: 'Herramientas', icon: Wrench, permission: 'tools.access' },
  ];
}

function can(session: IntranetSession, permission: IntranetPermission) {
  if (session.role === 'admin') return true;
  return session.permissions.includes(permission);
}

export function IntranetShell({
  locale,
  session,
  title,
  breadcrumb,
  children,
}: {
  locale: string;
  session: IntranetSession;
  title: string;
  breadcrumb?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems(locale).filter((item) => can(session, item.permission));

  async function logout() {
    await fetch('/api/intranet/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.replace(`/${locale}/intranet`);
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#1E1E1E]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] gap-4 p-3 sm:p-4 lg:gap-5 lg:p-5">
        <aside className="hidden w-[240px] shrink-0 flex-col rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(7,31,94,0.06)] lg:flex">
          <Link href={`/${locale}`} className="mb-6 inline-flex px-1">
            <Image src="/images/logo.png" alt="Rural Commerce" width={160} height={44} className="h-9 w-auto" />
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#071F5E]/8 text-[#071F5E]'
                      : 'text-[#071F5E]/70 hover:bg-[#071F5E]/5 hover:text-[#071F5E]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 rounded-2xl bg-[#071F5E] p-4 text-white">
            <BookOpen className="mb-2 h-5 w-5 text-[#52ADAD]" />
            <p className="text-sm font-semibold">¿Necesitas ayuda?</p>
            <p className="mt-1 text-xs leading-5 text-white/70">Guía rápida de la intranet Rural Commerce.</p>
            <a
              href={`/${locale}/contacto`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#071F5E]"
            >
              Documentación
            </a>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="relative overflow-hidden rounded-2xl bg-[#071F5E] px-5 pb-16 pt-5 text-white sm:px-7 sm:pb-20 sm:pt-6">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M0 180 C120 120 220 200 340 140 S560 60 800 120" fill="none" stroke="#A5D9EF" strokeWidth="1.2" />
              <path d="M0 200 C160 150 280 220 420 160 S680 80 800 150" fill="none" stroke="#52ADAD" strokeWidth="1" opacity="0.7" />
            </svg>
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  {breadcrumb || `Páginas / ${title}`}
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </div>
          </div>

          <div className="relative z-10 -mt-10 px-1 sm:-mt-12 sm:px-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_12px_40px_rgba(7,31,94,0.08)] sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071F5E] text-sm font-bold text-white">
                  {session.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#071F5E]">{session.name}</p>
                  <p className="truncate text-xs text-[#1E1E1E]/55">{session.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#071F5E] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {session.role}
                </span>
                <Link
                  href={`/${locale}/intranet/herramientas`}
                  className="rounded-full bg-[#009179] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white"
                >
                  Herramientas
                </Link>
              </div>
            </div>

            {/* mobile nav */}
            <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                      active ? 'bg-[#009179] text-white' : 'bg-white text-[#071F5E] shadow-sm'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
