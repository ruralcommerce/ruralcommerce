'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPlantaChecklist, getPlantaPageCopy } from '@/lib/planta-guide';

const STORAGE_KEY = 'planta-copey-checklist';

export function PlantaChecklist({ locale }: { locale: string }) {
  const items = getPlantaChecklist(locale);
  const t = getPlantaPageCopy(locale);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setDone({});
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }, [done, ready]);

  const progress = useMemo(() => {
    if (!items.length) return 0;
    const count = items.filter((item) => done[item.id]).length;
    return Math.round((count / items.length) * 100);
  }, [done, items]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#071F5E]">
          {t.obraProgress}: {progress}%
        </p>
        <div className="planta-progress mt-2" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      {items.map((item) => {
        const checked = Boolean(done[item.id]);
        return (
          <button
            key={item.id}
            type="button"
            className={`planta-check${checked ? ' is-done' : ''}`}
            onClick={() => setDone((current) => ({ ...current, [item.id]: !current[item.id] }))}
            aria-pressed={checked}
          >
            <span className="planta-check-mark" />
            <span>
              {item.urgent ? (
                <span className="planta-urgent">
                  {locale === 'pt-BR' ? 'Hoje' : locale === 'en' ? 'Now' : 'Hoy'}
                </span>
              ) : null}
              <strong className="block text-[#071F5E]">{item.title}</strong>
              <span className="mt-1 block text-sm leading-6 text-[#2F3336]">{item.body}</span>
              <span className="planta-legal-ref block">{item.legal}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
