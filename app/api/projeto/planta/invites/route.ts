import { NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { createPlantaInvite, readPlantaInvites } from '@/lib/planta-invites';
import { projectSiteBaseUrl } from '@/lib/project-brand';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function localeKey(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export async function GET(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  const invites = await readPlantaInvites();
  return NextResponse.json({ ok: true, invites });
}

export async function POST(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const label = trimField(body.label, 160);
  const locale = localeKey(trimField(body.locale, 12));
  const invite = await createPlantaInvite({
    label,
    createdBy: auth.session.memberId,
  });

  const conviteUrl = `${projectSiteBaseUrl()}/${locale}/impulsacr/convite`;
  const shareText = `Hola, te comparto el acceso a la guía de la mini-biorrefinería de Copey (Impulsa CR / Rural Commerce).\n\nCódigo: ${invite.code}\nEnlace: ${conviteUrl}`;

  await appendAuditEntry({
    action: 'planta_invite_create',
    actorType: 'team',
    actorId: auth.session.memberId,
    actorName: auth.session.name,
    targetRecordId: invite.code,
    metadata: { label: invite.label },
  });

  return NextResponse.json({
    ok: true,
    invite,
    conviteUrl,
    shareText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
  });
}
