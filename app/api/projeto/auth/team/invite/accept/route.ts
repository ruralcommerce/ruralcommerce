import { NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { completeTeamInvite, sanitizeTeamMember } from '@/lib/project-team-members';

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
  const token = trimField(body.token, 160);
  const name = trimField(body.name, 160);
  const password = trimField(body.password, 128);
  const passwordConfirm = trimField(body.passwordConfirm, 128);

  if (!token || !name || !password) {
    return NextResponse.json({ ok: false, message: 'Nome e senha são obrigatórios.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, message: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
  }

  if (password !== passwordConfirm) {
    return NextResponse.json({ ok: false, message: 'As senhas não coincidem.' }, { status: 400 });
  }

  const result = await completeTeamInvite({ token, name, password });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.reason === 'expired' ? 'Este convite expirou. Peça um novo convite.' : 'Convite inválido.',
      },
      { status: 400 }
    );
  }

  await appendAuditEntry({
    action: 'team_invite_complete',
    actorType: 'team',
    actorId: result.member.id,
    actorName: result.member.name,
    targetRecordId: result.member.id,
    metadata: { email: result.member.email },
  });

  return NextResponse.json({
    ok: true,
    member: sanitizeTeamMember(result.member),
  });
}
