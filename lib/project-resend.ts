import { Resend } from 'resend';
import { PROJECT_EXECUTOR, projectSiteBaseUrl } from '@/lib/project-brand';

export type ProjectEmailSendInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  /** Prefer List-Unsubscribe for broadcasts / reminders. */
  kind?: 'transactional' | 'broadcast';
  locale?: string;
  tags?: Array<{ name: string; value: string }>;
};

export type ProjectEmailSendResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean };

function trimEnv(name: string) {
  return process.env[name]?.trim() || '';
}

/** Raw mailbox from env (no display name). */
export function getResendFromEmail() {
  return trimEnv('RESEND_FROM_EMAIL');
}

export function getResendFromName() {
  return trimEnv('RESEND_FROM_NAME') || PROJECT_EXECUTOR;
}

export function getResendReplyTo() {
  return trimEnv('RESEND_REPLY_TO') || getResendFromEmail();
}

/**
 * "Rural Commerce <info@domain.com>" — improves trust vs bare address.
 * If RESEND_FROM_EMAIL already includes <>, return as-is.
 */
export function formatResendFromAddress() {
  const email = getResendFromEmail();
  if (!email) return '';
  if (email.includes('<') && email.includes('>')) return email;
  const name = getResendFromName().replace(/"/g, '');
  return `"${name}" <${email}>`;
}

export function isResendConfigured() {
  return Boolean(trimEnv('RESEND_API_KEY') && getResendFromEmail());
}

function localePath(locale?: string) {
  if (locale === 'pt-BR' || locale === 'en') return locale;
  return 'es';
}

function extractMailbox(from: string) {
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] || from).trim();
}

/**
 * Headers that help Gmail/Yahoo treat list/reminder mail as legitimate.
 * One-click points at the candidate profile (opt-out of communications).
 */
export function buildDeliverabilityHeaders(input?: {
  kind?: 'transactional' | 'broadcast';
  locale?: string;
}) {
  const fromMailbox = extractMailbox(getResendFromEmail());
  const site = projectSiteBaseUrl();
  const locale = localePath(input?.locale);
  const unsubUrl = `${site}/${locale}/perfil`;
  const mailto = fromMailbox
    ? `<mailto:${fromMailbox}?subject=unsubscribe>`
    : null;
  const listUnsub = mailto ? `<${unsubUrl}>, ${mailto}` : `<${unsubUrl}>`;

  const headers: Record<string, string> = {
    'List-Unsubscribe': listUnsub,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };

  // Mild hint for providers; not a substitute for proper DNS.
  if (input?.kind === 'broadcast') {
    headers.Precedence = 'bulk';
  }

  return headers;
}

export async function sendProjectResendEmail(
  input: ProjectEmailSendInput
): Promise<ProjectEmailSendResult> {
  const apiKey = trimEnv('RESEND_API_KEY');
  const from = formatResendFromAddress();
  if (!apiKey || !from) {
    return { ok: false, skipped: true, error: 'Resend not configured' };
  }

  const replyTo = input.replyTo || getResendReplyTo() || undefined;
  const headers = buildDeliverabilityHeaders({
    kind: input.kind || 'transactional',
    locale: input.locale,
  });

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: replyTo || undefined,
      headers,
      tags: input.tags,
    });

    if (error) {
      return { ok: false, error: error.message || String(error) };
    }
    return { ok: true, id: data?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
