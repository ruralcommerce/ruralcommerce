'use client';

/**
 * Esqueleto de carregamento do editor (substitui spinner genérico).
 */
export function EditorLoadingSkeleton() {
  return (
    <div className="flex h-screen min-h-0 bg-slate-100">
      <div className="flex w-[360px] flex-col border-r border-slate-200 bg-slate-50">
        <div className="h-14 animate-pulse border-b border-slate-200 bg-slate-200/60" />
        <div className="flex gap-2 border-b border-slate-200 p-4">
          <div className="h-9 flex-1 animate-pulse rounded-md bg-slate-200/70" />
          <div className="h-9 flex-1 animate-pulse rounded-md bg-slate-200/70" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="h-24 animate-pulse rounded-lg bg-slate-200/60" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-200/60" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-200/60" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 items-center justify-between border-b border-slate-200 bg-[#f8fafc] px-3">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 animate-pulse rounded-md bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded-md bg-slate-200" />
          </div>
        </div>
        <div className="flex-1 bg-slate-100/80 p-2">
          <div className="mx-auto h-full max-w-5xl animate-pulse rounded-xl border border-slate-200 bg-white/80 shadow-inner" />
        </div>
      </div>
    </div>
  );
}
