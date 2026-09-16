import { NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { redeemPlantaInvite } from '@/lib/planta-invites';
import { PLANTA_COOKIE, plantaCookieOptions, signPlantaSession } from '@/lib/planta-session';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const name = trimField(body.name, 120);
  const code = trimField(body.code, 40);

  const redeemed = await redeemPlantaInvite({ code, name });
  if (!redeemed.ok) {
    const status = redeemed.reason === 'missing' ? 400 : 401;
    return NextResponse.json({ ok: false, reason: redeemed.reason }, { status });
  }

  const token = signPlantaSession({
    code: redeemed.invite.code,
    name,
  });

  await appendAuditEntry({
    action: 'planta_invite_redeem',
    actorType: 'system',
    actorId: name,
    actorName: name,
    targetRecordId: redeemed.invite.code,
    metadata: { label: redeemed.invite.label },
  });

  const response = NextResponse.json({
    ok: true,
    code: redeemed.invite.code,
    label: redeemed.invite.label,
    name,
  });
  response.cookies.set(PLANTA_COOKIE, token, plantaCookieOptions());
  return response;
}
