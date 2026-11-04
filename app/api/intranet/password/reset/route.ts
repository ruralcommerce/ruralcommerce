import { NextResponse } from 'next/server';
import { completeUserPasswordReset } from '@/lib/intranet/users-store';

export const runtime = 'nodejs';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254).toLowerCase();
  const token = trimField(body.token, 128);
  const password = trimField(body.password, 128);
  const locale = trimField(body.locale, 10);

  if (!email || !isValidEmail(email) || !token) {
    return NextResponse.json(
      {
        ok: false,
        message:
          locale === 'pt-BR'
            ? 'Link inválido ou incompleto.'
            : locale === 'en'
              ? 'Invalid or incomplete link.'
              : 'Enlace inválido o incompleto.',
      },
      { status: 400 }
    );
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      {
        ok: false,
        message:
          locale === 'pt-BR'
            ? 'A senha deve ter pelo menos 6 caracteres.'
            : locale === 'en'
              ? 'Password must be at least 6 characters.'
              : 'La contraseña debe tener al menos 6 caracteres.',
      },
      { status: 400 }
    );
  }

  const result = await completeUserPasswordReset(email, token, password);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message:
          locale === 'pt-BR'
            ? 'Link inválido ou expirado.'
            : locale === 'en'
              ? 'Invalid or expired link.'
              : 'Enlace inválido o expirado.',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      locale === 'pt-BR'
        ? 'Senha atualizada com sucesso.'
        : locale === 'en'
          ? 'Password updated successfully.'
          : 'Contraseña actualizada correctamente.',
  });
}
