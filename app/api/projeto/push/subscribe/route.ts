import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { upsertPushSubscription, removePushSubscription } from '@/lib/project-push-store';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function verifyPassword(password: string, stored: string) {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hashBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (hashBuffer.length !== storedBuffer.length) return false;
  return timingSafeEqual(hashBuffer, storedBuffer);
}

async function findRecord(email: string) {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : [];
    return records.find((item: Record<string, unknown>) => {
      const user = (item.user as Record<string, unknown>) || {};
      const userEmail = typeof user.email === 'string' ? user.email : '';
      return userEmail.toLowerCase() === email.toLowerCase();
    }) as Record<string, unknown> | undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254);
  const password = trimField(body.password, 128);
  const locale = trimField(body.locale, 10) || 'es';
  const action = trimField(body.action, 20) || 'subscribe';

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  const record = await findRecord(email);
  if (!record) {
    return NextResponse.json({ ok: false, message: 'Nenhuma inscrição encontrada com este e-mail.' }, { status: 404 });
  }

  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';
  if (!passwordHash || !verifyPassword(password, passwordHash)) {
    return NextResponse.json({ ok: false, message: 'Senha inválida.' }, { status: 401 });
  }

  const profile = ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
  if (profile.marketingConsent !== true) {
    return NextResponse.json({ ok: false, message: 'Consentimento de comunicações não registrado.' }, { status: 403 });
  }

  if (action === 'unsubscribe') {
    await removePushSubscription(email);
    return NextResponse.json({ ok: true });
  }

  const subscription = body.subscription as Record<string, unknown> | undefined;
  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint : '';
  const keys = (subscription?.keys as Record<string, unknown>) || {};
  const p256dh = typeof keys.p256dh === 'string' ? keys.p256dh : '';
  const auth = typeof keys.auth === 'string' ? keys.auth : '';

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, message: 'Subscription inválida.' }, { status: 400 });
  }

  await upsertPushSubscription({
    email,
    locale,
    subscription: { endpoint, keys: { p256dh, auth } },
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
