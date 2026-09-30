import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  createSessionToken,
  expectedIntranetPassword,
  getSessionFromCookies,
  INTRANET_COOKIE,
  LEGACY_MARCA_COOKIE,
} from '@/lib/intranet/auth';
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/intranet/types';
import { authenticateUser } from '@/lib/intranet/users-store';

export const runtime = 'nodejs';

export async function GET() {
  const session = getSessionFromCookies(cookies());
  if (!session) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, session });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    action?: string;
  };

  if (body.action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(INTRANET_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set(LEGACY_MARCA_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  if (!password) {
    return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
  }

  let user = email ? await authenticateUser(email, password) : null;

  if (!user && password === expectedIntranetPassword()) {
    user = {
      id: 'usr_admin',
      name: email ? email.split('@')[0] : 'Equipo Rural Commerce',
      email: email || 'equipo@ruralcommerceglobal.com',
      password: '',
      role: 'admin',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.admin],
      active: true,
      kind: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (!user) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
  }

  const session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  const token = createSessionToken(session);
  const res = NextResponse.json({ ok: true, session });
  res.cookies.set(INTRANET_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookies.set(LEGACY_MARCA_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
