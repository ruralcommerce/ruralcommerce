import { NextResponse } from 'next/server';
import {
  findInviteByToken,
  publicInviteView,
  saveInviteEnrollmentDraft,
} from '@/lib/project-participant-invites';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function GET(
  _request: Request,
  context: { params: { token: string } }
) {
  const invite = await findInviteByToken(context.params.token || '');
  if (!invite || invite.status === 'revoked') {
    return NextResponse.json({ ok: false, message: 'Invitación no encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, invite: publicInviteView(invite) });
}

/** Save enrollment draft / registration email while the invitee progresses. */
export async function PUT(
  request: Request,
  context: { params: { token: string } }
) {
  const invite = await findInviteByToken(context.params.token || '');
  if (!invite || invite.status === 'revoked' || invite.status === 'completed') {
    return NextResponse.json({ ok: false, message: 'Invitación no disponible.' }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const draft =
    typeof body.enrollmentDraft === 'object' && body.enrollmentDraft !== null
      ? (body.enrollmentDraft as Record<string, unknown>)
      : {};
  const draftStep =
    typeof body.enrollmentDraftStep === 'number' ? body.enrollmentDraftStep : Number(body.enrollmentDraftStep) || 0;
  const registrationEmail = trimField(body.registrationEmail, 254);

  const updated = await saveInviteEnrollmentDraft(
    invite.token,
    draft,
    draftStep,
    registrationEmail || undefined
  );

  if (!updated) {
    return NextResponse.json({ ok: false, message: 'No se pudo guardar el avance.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, invite: publicInviteView(updated) });
}
