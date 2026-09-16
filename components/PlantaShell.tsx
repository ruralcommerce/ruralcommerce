'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { ProjectSiteHeader } from '@/components/ProjectSiteHeader';
import { usePlantaAuth } from '@/lib/planta-auth';
import { plantaNavItems, plantaPath } from '@/lib/planta-content';
import { cn } from '@/lib/planta-cn';

export function PlantaGuard({ locale, children }: { locale: string; children: ReactNode }) {
  const { canOpenPlanta } = usePlantaAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isConvite = pathname.includes('/planta/convite');

  useEffect(() => {
    if (!isConvite && !canOpenPlanta) {
      router.replace(plantaPath(locale, 'convite'));
    }
  }, [canOpenPlanta, isConvite, locale, router]);

  if (!isConvite && !canOpenPlanta) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-center text-sm text-[#2F3336]/70">
        Esta área es solo por convite. Redirigiendo…
      </div>
    );
  }

  return <>{children}</>;
}

export function PlantaShell({ locale, children }: { locale: string; children: ReactNode }) {
  const pathname = usePathname();
  const items = plantaNavItems(locale);
  const isConvite = pathname.includes('/planta/convite');

  return (
    <div className="flex min-h-dvh flex-col bg-[#F5F7FA]">
      <ProjectSiteHeader locale={locale} variant="bar" />
      {!isConvite ? (
        <nav className="overflow-x-auto border-b border-[#16325f] bg-[#071F5E] text-white">
          <div className="mx-auto flex max-w-6xl gap-1 px-3 py-2">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold',
                    active
                      ? 'bg-white text-[#071F5E]'
                      : item.urgent
                        ? 'bg-[#009179] text-white'
                        : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
