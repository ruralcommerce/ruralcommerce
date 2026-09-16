import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PLANTA_COOKIE, verifyPlantaSession } from '@/lib/planta-session';

export async function GET() {
  const token = cookies().get(PLANTA_COOKIE)?.value;
  const session = verifyPlantaSession(token);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    name: session.name,
    code: session.code,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PLANTA_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
