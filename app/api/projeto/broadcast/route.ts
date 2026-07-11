import { NextResponse } from 'next/server';
import {
  previewBroadcastCounts,
  sendProjectBroadcast,
  type BroadcastChannel,
  type BroadcastSegment,
} from '@/lib/project-broadcast';
import { appendBroadcastLog, listRecentBroadcasts } from '@/lib/project-broadcast-log';

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
const VALID_SEGMENTS: BroadcastSegment[] = ['consent', 'consent_approved'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password') || '';
  const auth = verifyTeamPassword(password);
  if (!auth.ok) {
    const status = auth.message.includes('inválida') ? 401 : 500;
    return NextResponse.json({ ok: false, message: auth.message }, { status });
  }

  const segment = (searchParams.get('segment') || 'consent') as BroadcastSegment;
  const localeFilter = searchParams.get('locale') || undefined;
  if (!VALID_SEGMENTS.includes(segment)) {
    return NextResponse.json({ ok: false, message: 'Segmento inválido.' }, { status: 400 });
  }

  const counts = await previewBroadcastCounts(segment, localeFilter || undefined);
  const recent = await listRecentBroadcasts(5);
  return NextResponse.json({ ok: true, counts, recent });
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

  const subject = trimField(body.subject, 200);
  const textBody = trimField(body.body, 8000);
  if (!subject || !textBody) {
    return NextResponse.json({ ok: false, message: 'Assunto e mensagem são obrigatórios.' }, { status: 400 });
  }

  const segment = (typeof body.segment === 'string' ? body.segment : 'consent') as BroadcastSegment;
  if (!VALID_SEGMENTS.includes(segment)) {
    return NextResponse.json({ ok: false, message: 'Segmento inválido.' }, { status: 400 });
  }

  const channels = Array.isArray(body.channels)
    ? body.channels.filter((c): c is BroadcastChannel => typeof c === 'string' && VALID_CHANNELS.includes(c as BroadcastChannel))
    : (['email', 'push', 'whatsapp'] as BroadcastChannel[]);

  if (!channels.length) {
    return NextResponse.json({ ok: false, message: 'Selecione pelo menos um canal.' }, { status: 400 });
  }

  const result = await sendProjectBroadcast({
    subject,
    body: textBody,
    pushTitle: trimField(body.pushTitle, 120) || undefined,
    pushBody: trimField(body.pushBody, 300) || undefined,
    link: trimField(body.link, 500) || undefined,
    localeFilter: trimField(body.localeFilter, 10) || undefined,
    segment,
    channels,
  });

  await appendBroadcastLog({
    subject,
    segment,
    channels,
    result,
    sentBy: 'team',
  });

  return NextResponse.json({ ok: true, result });
}
