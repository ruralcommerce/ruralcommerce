'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'planta-copey-checklist';
const EMPTY: Record<string, boolean> = {};

let state: Record<string, boolean> = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    state = {};
  }
}

function subscribe(listener: () => void) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureHydrated();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

function write(next: Record<string, boolean>) {
  state = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

type ChecklistContextValue = {
  toggle: (id: string) => void;
  isDone: (id: string) => boolean;
  progress: (ids: string[]) => number;
};

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function PlantaChecklistProvider({ children }: { children: ReactNode }) {
  const done = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    write({ ...current, [id]: !current[id] });
  }, []);

  const isDone = useCallback((id: string) => Boolean(done[id]), [done]);

  const progress = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return 0;
      return Math.round((ids.filter((id) => done[id]).length / ids.length) * 100);
    },
    [done]
  );

  const value = useMemo(() => ({ toggle, isDone, progress }), [toggle, isDone, progress]);

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>;
}

export function usePlantaChecklist() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('usePlantaChecklist debe usarse dentro de PlantaChecklistProvider');
  return ctx;
}
