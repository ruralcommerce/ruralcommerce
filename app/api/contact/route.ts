import { NextResponse } from 'next/server';
import { isResendConfigured, sendProjectResendEmail } from '@/lib/project-resend';

const DEFAULT_TO = 'info@ruralcommerceglobal.com';

const MAX = {
  subject: 280,
  name: 160,
  organization: 200,
  email: 254,
  whatsapp: 40,
  country: 120,
  region: 120,
  profile: 40,
  message: 8000,
} as const;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function trimField(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!isResendConfigured()) {
    return NextResponse.json({ ok: false as const, key: 'config' as const }, { status: 503 });
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false as const, key: 'invalidPayload' as const }, { status: 400 });
  }

  const body = json as Record<string, unknown>;

  // Honeypot: leave empty in real UI; bots often fill hidden fields.
  if (trimField(body._companyWebsite, 200)) {
    return NextResponse.json({ ok: true as const });
  }

  const subject = trimField(body.subject, MAX.subject);
  const name = trimField(body.name, MAX.name);
  const organization = trimField(body.organization, MAX.organization);
  const email = trimField(body.email, MAX.email);
  const whatsapp = trimField(body.whatsapp, MAX.whatsapp);
  const country = trimField(body.country, MAX.country);
  const region = trimField(body.region, MAX.region);
  const profile = trimField(body.profile, MAX.profile);
  const message = trimField(body.message, MAX.message);

  if (!subject || !name || !email || !message) {
    return NextResponse.json({ ok: false as const, key: 'missingFields' as const }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false as const, key: 'invalidEmail' as const }, { status: 400 });
  }

  const text = [
    `Asunto: ${subject}`,
    `Nombre: ${name}`,
    `Organización: ${organization || '—'}`,
    `Email: ${email}`,
    `WhatsApp: ${whatsapp || '—'}`,
    `País: ${country || '—'}`,
    `Región: ${region || '—'}`,
    `Perfil: ${profile || '—'}`,
    '',
    'Mensaje:',
    message,
  ].join('\n');

  const sendResult = await sendProjectResendEmail({
    to: [to],
    replyTo: email,
    subject: `Rural Commerce · Web — ${subject}`,
    text,
    kind: 'transactional',
    tags: [{ name: 'category', value: 'contact_form' }],
  });

  if (!sendResult.ok) {
    console.error('[api/contact] Resend:', sendResult.error);
    return NextResponse.json({ ok: false as const, key: 'sendFailed' as const }, { status: 502 });
  }

  return NextResponse.json({ ok: true as const });
}
