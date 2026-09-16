'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const SESSION_KEY = 'impulsa-planta-session';
const INVITES_KEY = 'impulsa-planta-invites';

export type PlantaSession =
  | { kind: 'intranet'; email: string }
  | { kind: 'planta'; name: string; code: string; org: string };

export type PlantaInvite = {
  code: string;
  label: string;
  org: string;
  reusable?: boolean;
  createdAt: string;
  redeemedAt?: string;
  redeemedBy?: string;
};

export const SEED_PLANT_INVITES: PlantaInvite[] = [
  {
    code: 'COPEY-22M2',
    label: 'Equipo de la cooperativa en Copey de Dota',
    org: 'Cooperativa · centro de acopio Copey',
    reusable: true,
    createdAt: '2026-09-16T00:00:00.000Z',
  },
  {
    code: 'IM-PLANTA-DEMO',
    label: 'Acompañamiento técnico Rural Commerce',
    org: 'Rural Commerce · Impulsa CR',
    reusable: true,
    createdAt: '2026-09-16T00:00:00.000Z',
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function syncAccessCookie(session: PlantaSession | null) {
  if (typeof document === 'undefined') return;
  if (session?.kind === 'planta' || session?.kind === 'intranet') {
    document.cookie = `impulsa-access=${session.kind}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    return;
  }
  document.cookie = 'impulsa-access=; path=/; max-age=0; SameSite=Lax';
}

function getStoredInvites(): PlantaInvite[] {
  const stored = readJson<PlantaInvite[] | null>(INVITES_KEY, null);
  if (!stored) return SEED_PLANT_INVITES;
  const extra = stored.filter((invite) => !SEED_PLANT_INVITES.some((seed) => seed.code === invite.code));
  const seeds = SEED_PLANT_INVITES.map((seed) => {
    const updated = stored.find((invite) => invite.code === seed.code);
    return updated ? { ...seed, ...updated, reusable: true } : seed;
  });
  return [...seeds, ...extra];
}

type PlantaAuthValue = {
  session: PlantaSession | null;
  invites: PlantaInvite[];
  redeemInvite: (code: string, name: string) => string | null;
  createInvite: (label: string, org: string) => PlantaInvite;
  markIntranetAccess: () => void;
  signOut: () => void;
  canOpenPlanta: boolean;
};

const PlantaAuthContext = createContext<PlantaAuthValue | null>(null);

export function PlantaAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlantaSession | null>(null);
  const [invites, setInvites] = useState<PlantaInvite[]>(SEED_PLANT_INVITES);

  useEffect(() => {
    const stored = readJson<PlantaSession | null>(SESSION_KEY, null);
    setSession(stored);
    setInvites(getStoredInvites());
    syncAccessCookie(stored);
  }, []);

  const redeemInvite = useCallback((code: string, name: string) => {
    const normalized = code.trim().toUpperCase();
    const current = getStoredInvites();
    const invite = current.find((item) => item.code.toUpperCase() === normalized);
    if (!invite) return 'Ese convite no existe. Pida uno al equipo de Impulsa CR.';
    if (!invite.reusable && invite.redeemedAt) {
      return 'Este convite ya fue usado.';
    }
    const next = current.map((item) =>
      item.code.toUpperCase() === normalized
        ? { ...item, redeemedAt: new Date().toISOString(), redeemedBy: name.trim() }
        : item
    );
    writeJson(INVITES_KEY, next);
    setInvites(next);
    const newSession: PlantaSession = {
      kind: 'planta',
      name: name.trim(),
      code: invite.code,
      org: invite.org,
    };
    writeJson(SESSION_KEY, newSession);
    syncAccessCookie(newSession);
    setSession(newSession);
    return null;
  }, []);

  const createInvite = useCallback((label: string, org: string) => {
    const code = `IM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 4)
      .toUpperCase()}`;
    const invite: PlantaInvite = {
      code,
      label: label.trim() || 'Convite a la planta',
      org: org.trim() || 'Impulsa CR',
      createdAt: new Date().toISOString(),
    };
    const updated = [invite, ...getStoredInvites()];
    writeJson(INVITES_KEY, updated);
    setInvites(updated);
    return invite;
  }, []);

  const markIntranetAccess = useCallback(() => {
    const newSession: PlantaSession = { kind: 'intranet', email: 'equipo@ruralcommerceglobal.com' };
    writeJson(SESSION_KEY, newSession);
    syncAccessCookie(newSession);
    setSession(newSession);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    syncAccessCookie(null);
    setSession(null);
  }, []);

  const canOpenPlanta = session?.kind === 'planta' || session?.kind === 'intranet';

  const value = useMemo(
    () => ({
      session,
      invites,
      redeemInvite,
      createInvite,
      markIntranetAccess,
      signOut,
      canOpenPlanta,
    }),
    [session, invites, redeemInvite, createInvite, markIntranetAccess, signOut, canOpenPlanta]
  );

  return <PlantaAuthContext.Provider value={value}>{children}</PlantaAuthContext.Provider>;
}

export function usePlantaAuth() {
  const ctx = useContext(PlantaAuthContext);
  if (!ctx) throw new Error('usePlantaAuth debe usarse dentro de PlantaAuthProvider');
  return ctx;
}
