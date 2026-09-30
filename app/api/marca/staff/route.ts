import { NextResponse } from 'next/server';
import {
  createStaffToken,
  expectedIntranetPassword,
  MARCA_STAFF_COOKIE,
  requireStaff,
} from '@/lib/marca/auth';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: requireStaff() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string; action?: string };

  if (body.action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(MARCA_STAFF_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  }

  if ((body.password || '').trim() !== expectedIntranetPassword()) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = createStaffToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MARCA_STAFF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
