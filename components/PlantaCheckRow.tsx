'use client';

import { usePlantaChecklist } from '@/lib/planta-checklist';
import { cn } from '@/lib/planta-cn';

export function PlantaCheckRow({
  id,
  title,
  detail,
  badge,
}: {
  id: string;
  title: string;
  detail?: string;
  badge?: string;
}) {
  const { isDone, toggle } = usePlantaChecklist();
  const checked = isDone(id);

  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-xl border bg-white p-4',
        checked ? 'border-[#071F5E]/40 bg-[#071F5E]/5' : 'border-[#E6EBF1]'
      )}
    >
      <input type="checkbox" checked={checked} onChange={() => toggle(id)} className="mt-1" />
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium text-[#071F5E]">{title}</span>
          {badge ? <span className="text-[11px] uppercase tracking-wide text-[#009179]">{badge}</span> : null}
        </span>
        {detail ? <span className="mt-1 block text-sm text-[#2F3336]/70">{detail}</span> : null}
      </span>
    </label>
  );
}

export function PlantaProgressNote({ ids, label }: { ids: string[]; label: string }) {
  const { progress } = usePlantaChecklist();
  return (
    <p className="text-sm text-[#2F3336]/70">
      {label}: <strong className="text-[#071F5E]">{progress(ids)}%</strong> marcado
    </p>
  );
}
