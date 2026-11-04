import { NextResponse } from 'next/server';
import { PROJECT_NAME, PROJECT_NAME_SHORT, projectSiteBaseUrl } from '@/lib/project-brand';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { isResendConfigured, sendProjectResendEmail } from '@/lib/project-resend';
import { createPasswordResetToken, passwordResetExpiresAt } from '@/lib/project-password';
import { setUserPasswordReset } from '@/lib/intranet/users-store';

export const runtime = 'nodejs';

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

const copy = {
  es: {
    subject: 'Restablece tu contraseña de la intranet',
    headline: 'Restablece tu contraseña',
    paragraphs: [
      `Recibimos una solicitud para restablecer la contraseña de tu acceso a la intranet de ${PROJECT_NAME}.`,
      'El enlace es válido por 2 horas. Si no pediste este cambio, ignora este correo.',
    ],
    ctaLabel: 'Crear nueva contraseña',
  },
  'pt-BR': {
    subject: 'Redefina sua senha da intranet',
    headline: 'Redefina sua senha',
    paragraphs: [
      `Recebemos um pedido para redefinir a senha do seu acesso à intranet de ${PROJECT_NAME}.`,
      'O link é válido por 2 horas. Se você não pediu essa alteração, ignore este e-mail.',
    ],
    ctaLabel: 'Criar nova senha',
  },
  en: {
    subject: 'Reset your intranet password',
    headline: 'Reset your password',
    paragraphs: [
      `We received a request to reset your intranet password for ${PROJECT_NAME}.`,
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

  const token = createPasswordResetToken();
  const expiresAt = passwordResetExpiresAt(2);
  const user = await setUserPasswordReset(email, token, expiresAt);
  if (!user) return genericOk;

  if (!isResendConfigured()) {
    console.warn('[intranet-password-forgot] Resend not configured — token saved but email skipped');
    return genericOk;
  }

  const t = copy[locale];
  const resetUrl = `${projectSiteBaseUrl()}/${locale}/intranet/recuperar-senha?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const content = {
    locale,
    recipientName: user.name,
    subject: t.subject,
    headline: t.headline,
    paragraphs: [...t.paragraphs],
    ctaLabel: t.ctaLabel,
    ctaUrl: resetUrl,
  };

  try {
    const sendResult = await sendProjectResendEmail({
      to: [email],
      subject: `${PROJECT_NAME_SHORT} · ${t.subject}`,
      text: buildProjectEmailText(content),
      html: buildProjectEmailHtml(content),
      kind: 'transactional',
      locale,
      tags: [{ name: 'category', value: 'intranet_password_reset' }],
    });
    if (!sendResult.ok && !sendResult.skipped) {
      console.error('[intranet-password-forgot] Resend error:', sendResult.error);
    }
  } catch (error) {
    console.error('[intranet-password-forgot] email failed:', error);
  }

  return genericOk;
}
