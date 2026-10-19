import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionFromCookies, sessionHas } from '@/lib/intranet/auth';
import type { IntranetSession } from '@/lib/intranet/types';

export function actividadStaff(): IntranetSession | null {
  const session = getSessionFromCookies(cookies());
  if (!session || !sessionHas(session, 'tools.actividades')) return null;
  return session;
}

export function staffUnauthorized() {
  return NextResponse.json({ ok: false, message: 'Sin acceso' }, { status: 401 });
}

export function staffActor(session: IntranetSession) {
  return `${session.name} (${session.email})`;
}
