import { NextResponse } from 'next/server';
import { appendBroadcastLog } from '@/lib/project-broadcast-log';
import { previewConvenioPendingCount, resendConvenioInvitations } from '@/lib/project-convenio-reminder';
import type { BroadcastChannel } from '@/lib/project-broadcast';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function verifyTeamPassword(password: string) {
  const expected = (process.env.PROJETO_TEAM_PASSWORD || '').trim();
  if (!expected) return { ok: false as const, message: 'Defina PROJETO_TEAM_PASSWORD no ambiente.' };
  if (password !== expected) return { ok: false as const, message: 'Senha da equipe inválida.' };
  return { ok: true as const };
}

const VALID_CHANNELS: BroadcastChannel[] = ['email', 'push', 'whatsapp'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password') || '';
  const auth = verifyTeamPassword(password);
  if (!auth.ok) {
    const status = auth.message.includes('inválida') ? 401 : 500;
    return NextResponse.json({ ok: false, message: auth.message }, { status });
  }

  const localeFilter = searchParams.get('locale') || undefined;
  const counts = await previewConvenioPendingCount(localeFilter || undefined);
  return NextResponse.json({ ok: true, counts });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const password = trimField(body.password, 128);
  const auth = verifyTeamPassword(password);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.message.includes('inválida') ? 401 : 500 });
  }

  const channels = Array.isArray(body.channels)
    ? body.channels.filter((c): c is BroadcastChannel => typeof c === 'string' && VALID_CHANNELS.includes(c as BroadcastChannel))
    : (['email'] as BroadcastChannel[]);

  if (!channels.length) {
    return NextResponse.json({ ok: false, message: 'Selecione pelo menos um canal.' }, { status: 400 });
  }

  const localeFilter = trimField(body.localeFilter, 10) || undefined;
  const result = await resendConvenioInvitations(localeFilter, channels);

  await appendBroadcastLog({
    subject: 'Reenvio convite convenio',
    segment: 'consent_approved',
    channels,
    result,
    sentBy: 'team-resend-convenio',
  });

  return NextResponse.json({ ok: true, result });
}
