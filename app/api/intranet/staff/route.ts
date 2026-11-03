import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  createSessionToken,
  expectedIntranetPassword,
  getSessionFromCookies,
  INTRANET_COOKIE,
  LEGACY_MARCA_COOKIE,
} from '@/lib/intranet/auth';
import { intranetHomePath } from '@/lib/intranet/home';
import { ROLE_DEFAULT_PERMISSIONS, sessionToPublic, type IntranetUser } from '@/lib/intranet/types';
import { authenticateUser } from '@/lib/intranet/users-store';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = getSessionFromCookies(cookies());
  if (!session) return NextResponse.json({ ok: false });
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'es';
  return NextResponse.json({
    ok: true,
    session,
    home: intranetHomePath(locale, session),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    action?: string;
    locale?: string;
    remember?: boolean;
  };

  if (body.action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(INTRANET_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set(LEGACY_MARCA_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();
  const locale = body.locale || 'es';

  if (!password) {
    return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
  }

  let user = email ? await authenticateUser(email, password) : null;

  // Bootstrap shared password → staff admin (dev / emergency)
  if (!user && password === expectedIntranetPassword()) {
    user = {
      id: 'usr_admin',
      name: email ? email.split('@')[0] : 'Equipo Rural Commerce',
      email: email || 'equipo@ruralcommerceglobal.com',
      password: '',
      passwordHashed: true,
      role: 'admin',
      profile: 'staff_interno',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.admin],
      scope: {},
      active: true,
      kind: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies IntranetUser;
  }

  if (!user) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
  }

  const session = sessionToPublic(user);
  const token = createSessionToken(session);
  const home = intranetHomePath(locale, session);
  const maxAge = body.remember === false ? 60 * 60 * 12 : 60 * 60 * 24 * 30;

  const res = NextResponse.json({ ok: true, session, home });
  res.cookies.set(INTRANET_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookies.set(LEGACY_MARCA_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
