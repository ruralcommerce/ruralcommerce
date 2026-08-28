import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import {
  formatReminderResultMessage,
  sendParticipantReminders,
  type ParticipantReminderType,
} from '@/lib/project-participant-reminders';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

const VALID_TYPES: ParticipantReminderType[] = ['convenio', 'diagnosis'];

export async function POST(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.message.includes('inválida') ? 401 : 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const type = trimField(body.type, 20) as ParticipantReminderType;
  const ids = Array.isArray(body.ids)
    ? body.ids.map((id) => trimField(id, 160)).filter(Boolean)
    : [];

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, message: 'Tipo de recordatorio inválido.' }, { status: 400 });
  }

  if (!ids.length) {
    return NextResponse.json({ ok: false, message: 'Selecciona al menos un participante.' }, { status: 400 });
  }

  const result = await sendParticipantReminders(type, ids, {
    memberId: auth.session.memberId,
    name: auth.session.name,
  });

  if (result.eligible === 0) {
    return NextResponse.json({
      ok: false,
      message: 'Ningún participante seleccionado está pendiente para este recordatorio.',
      result,
    }, { status: 400 });
  }

  return NextResponse.json({
    ok: result.email.sent > 0,
    message: formatReminderResultMessage(result),
    result,
  });
}
