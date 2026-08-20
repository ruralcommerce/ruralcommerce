import { NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import {
  createOrRefreshTeamInvite,
  findTeamMemberByInviteToken,
  toPublicTeamMember,
} from '@/lib/project-team-members';
import { sendTeamInviteEmail } from '@/lib/project-team-invite-email';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = trimField(searchParams.get('token'), 160);
  const member = token ? await findTeamMemberByInviteToken(token) : null;

  if (!member) {
    return NextResponse.json({ ok: false, message: 'Convite inválido ou expirado.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    email: member.email,
  });
}

export async function POST(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.message.includes('inválida') ? 401 : 500 });
  }

  if (auth.session.role !== 'master') {
    return NextResponse.json({ ok: false, message: 'Apenas o usuário master pode convidar a equipe.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254).toLowerCase();
  const locale = localeKey(trimField(body.locale, 12));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'Informe um e-mail válido.' }, { status: 400 });
  }

  const invited = await createOrRefreshTeamInvite({
    email,
    invitedBy: auth.session.memberId,
  });

  if (!invited.ok) {
    return NextResponse.json({ ok: false, message: 'Já existe um usuário ativo com este e-mail.' }, { status: 409 });
  }

  const emailResult = await sendTeamInviteEmail({
    email,
    token: invited.token,
    locale,
  });

  await appendAuditEntry({
    action: 'team_invite',
    actorType: 'team',
    actorId: auth.session.memberId,
    actorName: auth.session.name,
    targetRecordId: invited.member.id,
    metadata: { email, sent: emailResult.sent },
  });

  if (!emailResult.sent) {
    return NextResponse.json({
      ok: false,
      message: 'O convite foi criado, mas o e-mail não pôde ser enviado. Verifique a configuração de e-mail.',
      member: toPublicTeamMember(invited.member),
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    member: toPublicTeamMember(invited.member),
  });
}
