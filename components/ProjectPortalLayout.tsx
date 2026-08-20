import type { ReactNode } from 'react';

export function ProjectPortalHero({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#061F5B] text-white shadow-lg shadow-[#061F5B]/10">
      <div className="relative px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#23B8B5]/20 to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
            {description ? <p className="mt-3 text-sm leading-6 text-white/80">{description}</p> : null}
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
        <div className="relative mt-5 h-1 w-10 rounded-full bg-[#23B8B5]" />
      </div>
    </div>
  );
}

export function ProjectPortalShell({
  sidebar,
  children,
}: {
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  if (!sidebar) {
    return <div className="space-y-5">{children}</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-24">{sidebar}</aside>
      <div className="min-w-0 space-y-5">{children}</div>
    </div>
  );
}

export function ProjectPortalPanel({
  title,
  subtitle,
  children,
  tone = 'default',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'default' | 'accent' | 'muted';
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-[#CFE8E8] bg-[#F3FAFA]'
      : tone === 'muted'
        ? 'border-[#E6EBF1] bg-[#FBFCFD]'
        : 'border-[#E6EBF1] bg-white';

  return (
    <section className={`rounded-[24px] border p-5 shadow-sm sm:p-6 ${toneClass}`}>
      {title ? (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{title}</p>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function ProjectPortalStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function ProjectPortalStat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E6EBF1] bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1D6359]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#071F5E]">{value}</p>
    </div>
  );
}

export function ProjectPortalSteps({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  return (
    <ProjectPortalPanel title={title} tone="accent">
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-snug text-[#2F3336]/90">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#061F5B] text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </ProjectPortalPanel>
  );
}

export function ProjectPortalAnswerGrid({
  entries,
}: {
  entries: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map((entry) => (
        <div key={entry.label} className="rounded-2xl border border-[#E6EBF1] bg-[#F7FAFB] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1D6359]">{entry.label}</p>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/90">{entry.value}</p>
        </div>
      ))}
    </div>
  );
}
