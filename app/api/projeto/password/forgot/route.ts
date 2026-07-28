import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';
import { PROJECT_NAME, projectSiteBaseUrl } from '@/lib/project-brand';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { createPasswordResetToken, passwordResetExpiresAt } from '@/lib/project-password';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function localeKey(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRecords(records: unknown[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

const copy = {
  es: {
    subject: 'Restablece tu contraseña del proyecto',
    headline: 'Restablece tu contraseña',
    paragraphs: [
      `Recibimos una solicitud para restablecer la contraseña de tu acceso al proyecto ${PROJECT_NAME}.`,
      'El enlace es válido por 2 horas. Si no pediste este cambio, ignora este correo.',
    ],
    ctaLabel: 'Crear nueva contraseña',
  },
  'pt-BR': {
    subject: 'Redefina sua senha do projeto',
    headline: 'Redefina sua senha',
    paragraphs: [
      `Recebemos um pedido para redefinir a senha do seu acesso ao projeto ${PROJECT_NAME}.`,
      'O link é válido por 2 horas. Se você não pediu essa alteração, ignore este e-mail.',
    ],
    ctaLabel: 'Criar nova senha',
  },
  en: {
    subject: 'Reset your project password',
    headline: 'Reset your password',
    paragraphs: [
      `We received a request to reset your password for ${PROJECT_NAME}.`,
      'This link is valid for 2 hours. If you did not request this change, ignore this email.',
    ],
    ctaLabel: 'Create a new password',
  },
} as const;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254).toLowerCase();
  const locale = localeKey(trimField(body.locale, 10));

  // Always return ok to avoid leaking whether the email exists.
  const genericOk = NextResponse.json({
    ok: true,
    message:
      locale === 'en'
        ? 'If an account exists for this email, you will receive a reset link shortly.'
        : locale === 'pt-BR'
          ? 'Se existir uma conta com este e-mail, você receberá um link de redefinição em breve.'
          : 'Si existe una cuenta con este correo, recibirás un enlace de restablecimiento en breve.',
  });

  if (!email || !isValidEmail(email)) return genericOk;

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const index = records.findIndex((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    return typeof user.email === 'string' && user.email.toLowerCase() === email;
  });

  if (index === -1) return genericOk;

  const record = records[index];
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const profile = ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
  const token = createPasswordResetToken();
  const expiresAt = passwordResetExpiresAt(2);

  records[index] = {
    ...record,
    user: {
      ...user,
      passwordReset: { token, expiresAt },
    },
  };
  await writeRecords(records);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.warn('[password-forgot] Resend not configured — token saved but email skipped');
    return genericOk;
  }

  const name = typeof profile.name === 'string' ? profile.name : '';
  const resetUrl = `${projectSiteBaseUrl()}/${locale}/projeto/recuperar-senha?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const t = copy[locale];
  const content = {
    locale,
    recipientName: name,
    subject: t.subject,
    headline: t.headline,
    paragraphs: [...t.paragraphs],
    ctaLabel: t.ctaLabel,
    ctaUrl: resetUrl,
  };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: `[${PROJECT_NAME}] ${t.subject}`,
      text: buildProjectEmailText(content),
      html: buildProjectEmailHtml(content),
    });
    if (error) console.error('[password-forgot] Resend error:', error);
  } catch (error) {
    console.error('[password-forgot] email failed:', error);
  }

  return genericOk;
}
