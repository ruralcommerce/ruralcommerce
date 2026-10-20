import { NextResponse } from 'next/server';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { buildParticipantInviteEmailContent } from '@/lib/project-invite-email';
import {
  createParticipantInvite,
  inviteOnboardingUrl,
  isValidInviteEmail,
  listParticipantInvites,
  markInviteSent,
  publicInviteView,
} from '@/lib/project-participant-invites';
import { isResendConfigured, sendProjectResendEmail } from '@/lib/project-resend';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password') || '';
  const auth = verifyTeamAccess(request, password);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  const invites = await listParticipantInvites();
  return NextResponse.json({
    ok: true,
    invites: invites.map((invite) => ({
      ...publicInviteView(invite),
      note: invite.note,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      sentAt: invite.sentAt,
      createdBy: invite.createdBy,
      onboardingUrl: inviteOnboardingUrl(invite.token, invite.locale),
    })),
  });
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
  const auth = verifyTeamAccess(request, password);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message },
      { status: auth.message.includes('inválida') ? 401 : 500 }
    );
  }

  const email = trimField(body.email, 254).toLowerCase();
  const locale = trimField(body.locale, 12) || 'es';
  const note = trimField(body.note, 500);
  const sendEmail = body.sendEmail !== false;

  if (!isValidInviteEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  const invite = await createParticipantInvite({
    email,
    locale,
    note,
    createdBy: auth.session.memberId,
  });

  const content = buildParticipantInviteEmailContent(invite.invitedEmail, invite.token, invite.locale);
  const onboardingUrl = inviteOnboardingUrl(invite.token, invite.locale);

  let emailResult: { ok: boolean; skipped?: boolean; error?: string } = { ok: false, skipped: true };

  if (sendEmail) {
    if (!isResendConfigured()) {
      emailResult = { ok: false, skipped: true, error: 'resend-not-configured' };
    } else {
      const sendResult = await sendProjectResendEmail({
        to: [invite.invitedEmail],
        subject: content.subject,
        html: buildProjectEmailHtml(content),
        text: buildProjectEmailText(content),
        kind: 'transactional',
        locale: invite.locale,
        tags: [
          { name: 'category', value: 'participant_invite' },
          { name: 'invite_id', value: invite.id },
        ],
      });
      emailResult = sendResult.ok
        ? { ok: true }
        : { ok: false, error: sendResult.error || 'send-failed' };
      if (sendResult.ok) {
        await markInviteSent(invite.token);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    invite: {
      ...publicInviteView(invite),
      note: invite.note,
      createdAt: invite.createdAt,
      sentAt: emailResult.ok ? new Date().toISOString() : invite.sentAt,
      onboardingUrl,
    },
    email: emailResult,
    preview: {
      subject: content.subject,
      headline: content.headline,
      ctaLabel: content.ctaLabel,
      ctaUrl: onboardingUrl,
    },
  });
}
