import {
  listConvenioPendingRecipients,
  sendDirectProjectMessage,
  type BroadcastChannel,
  type BroadcastResult,
} from '@/lib/project-broadcast';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { buildApprovalEmailContent } from '@/lib/project-email-messages';

const approvalPushCopy = {
  es: 'Recordatorio: firma el convenio en línea para continuar con el diagnóstico.',
  'pt-BR': 'Lembrete: assine o convênio online para continuar com o diagnóstico.',
  en: 'Reminder: sign the agreement online to continue with the diagnosis.',
} as const;

function localeKey(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function convenioPath(locale?: string) {
  return `/${localeKey(locale)}/projeto/convenio`;
}

export async function previewConvenioPendingCount(localeFilter?: string) {
  const recipients = await listConvenioPendingRecipients(localeFilter);
  const withPhone = recipients.filter((r) => Boolean(r.phone?.trim())).length;
  return { total: recipients.length, withPhone, withoutPhone: recipients.length - withPhone };
}

/** Resend the formatted convenio invitation to approved participants who have not signed yet. */
export async function resendConvenioInvitations(
  localeFilter?: string,
  channels: BroadcastChannel[] = ['email']
): Promise<BroadcastResult> {
  const recipients = await listConvenioPendingRecipients(localeFilter);
  const result: BroadcastResult = {
    recipients: recipients.length,
    email: { sent: 0, skipped: 0, failed: 0 },
    push: { sent: 0, skipped: 0, failed: 0 },
    whatsapp: { sent: 0, skipped: 0, failed: 0 },
  };

  for (const recipient of recipients) {
    const locale = localeKey(recipient.locale);
    const content = buildApprovalEmailContent(recipient.name || recipient.email, locale);
    const channelResult = await sendDirectProjectMessage(
      recipient,
      {
        subject: content.subject,
        body: buildProjectEmailText(content),
        html: buildProjectEmailHtml(content),
        pushTitle: content.subject,
        pushBody: approvalPushCopy[locale],
        link: convenioPath(locale),
      },
      channels
    );
    result.email.sent += channelResult.email.sent;
    result.email.skipped += channelResult.email.skipped;
    result.email.failed += channelResult.email.failed;
    result.push.sent += channelResult.push.sent;
    result.push.skipped += channelResult.push.skipped;
    result.push.failed += channelResult.push.failed;
    result.whatsapp.sent += channelResult.whatsapp.sent;
    result.whatsapp.skipped += channelResult.whatsapp.skipped;
    result.whatsapp.failed += channelResult.whatsapp.failed;
  }

  return result;
}
