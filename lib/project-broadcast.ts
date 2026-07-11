import { readFile } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';
import { sendPushToEmails } from '@/lib/project-push';
import { sendUtilityWhatsApp, isWhatsAppConfigured } from '@/lib/project-whatsapp';
import { PROJECT_NAME } from '@/lib/project-brand';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

export type BroadcastSegment = 'consent' | 'consent_approved';
export type BroadcastChannel = 'email' | 'push' | 'whatsapp';

export type BroadcastInput = {
  subject: string;
  body: string;
  pushTitle?: string;
  pushBody?: string;
  link?: string;
  /** Filter recipients by profile locale; omit for all locales */
  localeFilter?: string;
  segment: BroadcastSegment;
  channels: BroadcastChannel[];
};

export type BroadcastRecipient = {
  id: string;
  email: string;
  phone?: string;
  name: string;
  locale?: string;
};

export type ChannelStats = { sent: number; skipped: number; failed: number };

export type BroadcastResult = {
  recipients: number;
  email: ChannelStats;
  push: ChannelStats;
  whatsapp: ChannelStats;
};

function siteBaseUrl() {
  return (process.env.PROJETO_SITE_URL?.trim() || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
}

function localeKeyOf(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function absoluteLink(relativeOrAbsolute: string | undefined, locale?: string) {
  if (!relativeOrAbsolute) {
    return `${siteBaseUrl()}/${localeKeyOf(locale)}/perfil`;
  }
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute;
  const pathPart = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  return `${siteBaseUrl()}${pathPart}`;
}

function clip(value: string, max: number) {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listBroadcastRecipients(input: Pick<BroadcastInput, 'segment' | 'localeFilter'>) {
  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const recipients: BroadcastRecipient[] = [];

  for (const record of records) {
    const profile = (record.profile as Record<string, unknown>) || {};
    const user = (record.user as Record<string, unknown>) || {};
    if (profile.marketingConsent !== true) continue;
    if (input.segment === 'consent_approved' && record.status !== 'approved') continue;

    const email = typeof user.email === 'string' ? user.email : '';
    if (!email) continue;

    const locale = typeof profile.locale === 'string' ? profile.locale : 'es';
    if (input.localeFilter && input.localeFilter !== 'all' && locale !== input.localeFilter) continue;

    recipients.push({
      id: typeof record.id === 'string' ? record.id : email,
      email,
      phone: typeof profile.phone === 'string' ? profile.phone : undefined,
      name: typeof profile.name === 'string' ? profile.name : '',
      locale,
    });
  }

  return recipients;
}

export type BroadcastMessageContent = Pick<
  BroadcastInput,
  'subject' | 'body' | 'pushTitle' | 'pushBody' | 'link'
>;

function buildPushMessage(input: BroadcastMessageContent, locale?: string) {
  return {
    title: clip(input.pushTitle || input.subject, 60),
    body: clip(input.pushBody || input.body, 180),
    url: absoluteLink(input.link, locale),
  };
}

function buildEmailText(input: BroadcastMessageContent, recipient: BroadcastRecipient) {
  const link = absoluteLink(input.link, recipient.locale);
  const greeting =
    localeKeyOf(recipient.locale) === 'en'
      ? `Hi ${recipient.name || ''},`.trim()
      : localeKeyOf(recipient.locale) === 'pt-BR'
        ? `Olá ${recipient.name || ''},`.trim()
        : `Hola ${recipient.name || ''},`.trim();

  return [greeting, '', input.body, '', link, '', `— ${PROJECT_NAME} / Rural Commerce`].join('\n');
}

async function dispatchProjectMessages(
  recipients: BroadcastRecipient[],
  input: BroadcastMessageContent,
  channels: Set<BroadcastChannel>
): Promise<BroadcastResult> {
  const result: BroadcastResult = {
    recipients: recipients.length,
    email: { sent: 0, skipped: 0, failed: 0 },
    push: { sent: 0, skipped: 0, failed: 0 },
    whatsapp: { sent: 0, skipped: 0, failed: 0 },
  };

  if (!recipients.length) return result;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const resend = apiKey && from ? new Resend(apiKey) : null;

  if (channels.has('email')) {
    if (!resend) {
      result.email.skipped = recipients.length;
    } else {
      for (const recipient of recipients) {
        try {
          const { error } = await resend.emails.send({
            from: from!,
            to: [recipient.email],
            subject: `[${PROJECT_NAME}] ${input.subject}`,
            text: buildEmailText(input, recipient),
          });
          if (error) {
            console.error('[project-broadcast] email error:', recipient.email, error);
            result.email.failed += 1;
          } else {
            result.email.sent += 1;
          }
        } catch (error) {
          console.error('[project-broadcast] email failed:', recipient.email, error);
          result.email.failed += 1;
        }
      }
    }
  }

  if (channels.has('push')) {
    for (const recipient of recipients) {
      const pushStats = await sendPushToEmails([recipient.email], buildPushMessage(input, recipient.locale));
      result.push.sent += pushStats.sent;
      result.push.skipped += pushStats.skipped;
      result.push.failed += pushStats.failed;
    }
  }

  if (channels.has('whatsapp')) {
    if (!isWhatsAppConfigured()) {
      result.whatsapp.skipped = recipients.length;
    } else {
      for (const recipient of recipients) {
        if (!recipient.phone) {
          result.whatsapp.skipped += 1;
          continue;
        }
        const sendResult = await sendUtilityWhatsApp({
          toPhone: recipient.phone,
          recipientName: recipient.name || recipient.email,
          summary: clip(input.pushBody || input.body, 200),
          link: absoluteLink(input.link, recipient.locale),
          locale: recipient.locale,
        });
        if (sendResult.skipped) result.whatsapp.skipped += 1;
        else if (sendResult.ok) result.whatsapp.sent += 1;
        else result.whatsapp.failed += 1;
      }
    }
  }

  return result;
}

export async function sendProjectBroadcast(input: BroadcastInput): Promise<BroadcastResult> {
  const recipients = await listBroadcastRecipients(input);
  return dispatchProjectMessages(recipients, input, new Set(input.channels));
}

/** Transactional message to one participant (e.g. approval). Does not require marketing consent. */
export async function sendDirectProjectMessage(
  recipient: BroadcastRecipient,
  input: BroadcastMessageContent,
  channels: BroadcastChannel[]
) {
  return dispatchProjectMessages([recipient], input, new Set(channels));
}

export async function previewBroadcastCounts(segment: BroadcastSegment, localeFilter?: string) {
  const recipients = await listBroadcastRecipients({ segment, localeFilter });
  const withPhone = recipients.filter((r) => Boolean(r.phone?.trim())).length;
  return { total: recipients.length, withPhone, withoutPhone: recipients.length - withPhone };
}
