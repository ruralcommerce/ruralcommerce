import { Resend } from 'resend';
import { sendDirectProjectMessage } from '@/lib/project-broadcast';
import {
  PROJECT_NAME,
  PROJECT_EXECUTOR,
} from '@/lib/project-brand';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { buildApprovalEmailContent } from '@/lib/project-email-messages';

const DEFAULT_NOTIFY_EMAILS = [
  'operations@ruralcommerceglobal.com',
  'tiagorezende@ruralcommerceglobal.com',
  'pablogonzalez@ruralcommerceglobal.com',
] as const;

type InscriptionNotifyRecord = {
  id: string;
  createdAt: string;
  profile: {
    name: string;
    email?: string;
    phone?: string;
    organization?: string;
    city?: string;
    role?: string;
    interest?: string;
    message?: string;
    locale?: string;
  };
  user: {
    email: string;
  };
};

function parseNotifyEmails(raw: string | undefined) {
  if (!raw?.trim()) return [...DEFAULT_NOTIFY_EMAILS];
  return raw
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function localeKeyOf(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function siteBaseUrl() {
  return (process.env.PROJETO_SITE_URL?.trim() || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
}

function adminUrl(locale?: string) {
  return `${siteBaseUrl()}/${localeKeyOf(locale)}/admin`;
}

function convenioPath(locale?: string) {
  return `/${localeKeyOf(locale)}/projeto/convenio`;
}

const approvalPushCopy = {
  es: 'Perfil aprobado. Firma el convenio en línea para continuar con el diagnóstico.',
  'pt-BR': 'Perfil aprovado. Assine o convênio online para continuar com o diagnóstico.',
  en: 'Profile approved. Sign the agreement online to continue with the diagnosis.',
} as const;

function buildTeamInscriptionEmail(record: InscriptionNotifyRecord) {
  const profile = record.profile;
  const locale = profile.locale || 'es';
  const subjectName = profile.organization || profile.name;
  const paragraphs = [
    `Nova inscrição recebida no projeto ${PROJECT_NAME}.`,
    `Nome: ${profile.name}`,
    `E-mail: ${record.user.email}`,
    `Telefone: ${profile.phone || '—'}`,
    `Organização: ${profile.organization || '—'}`,
    `Cidade: ${profile.city || '—'}`,
    `Interesse: ${profile.interest || '—'}`,
    profile.message ? `Mensagem: ${profile.message}` : '',
  ].filter(Boolean);

  return {
    subject: `[${PROJECT_NAME}] Nova inscrição — ${subjectName}`,
    content: {
      locale,
      recipientName: PROJECT_EXECUTOR,
      subject: `Nova inscrição — ${subjectName}`,
      headline: `Nova inscrição — ${subjectName}`,
      paragraphs,
      ctaLabel: 'Abrir painel da equipe',
      ctaUrl: adminUrl(locale),
      footnote: `ID: ${record.id} · ${record.createdAt}`,
    },
  };
}

export async function notifyNewProjectInscription(record: InscriptionNotifyRecord) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    console.warn('[project-inscription-notify] Resend not configured — email skipped');
    return;
  }

  const to = parseNotifyEmails(process.env.PROJETO_INSCRIPTION_NOTIFY_EMAILS);
  if (!to.length) {
    console.warn('[project-inscription-notify] No recipients configured — email skipped');
    return;
  }

  const profile = record.profile;
  const subjectName = profile.organization || profile.name;
  const { subject, content } = buildTeamInscriptionEmail(record);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: record.user.email,
    subject,
    text: buildProjectEmailText(content),
    html: buildProjectEmailHtml(content),
  });

  if (error) {
    console.error('[project-inscription-notify] Resend error:', error);
  }
}

/**
 * Sent to the CANDIDATE when the team approves their profile.
 * Uses email + push + WhatsApp Utility (no SMS).
 */
export async function notifyProjectApproval(record: InscriptionNotifyRecord) {
  const locale = localeKeyOf(record.profile.locale);
  const candidateEmail = record.user.email;
  if (!candidateEmail) return;

  const emailContent = buildApprovalEmailContent(record.profile.name, locale);

  try {
    await sendDirectProjectMessage(
      {
        id: record.id,
        email: candidateEmail,
        phone: record.profile.phone,
        name: record.profile.name,
        locale: record.profile.locale,
      },
      {
        subject: emailContent.subject,
        body: buildProjectEmailText(emailContent),
        pushTitle: emailContent.subject,
        pushBody: approvalPushCopy[locale],
        link: convenioPath(locale),
        html: buildProjectEmailHtml(emailContent),
      },
      ['email', 'push', 'whatsapp']
    );
  } catch (error) {
    console.error('[project-approval-notify] direct message failed:', error);
  }
}

/** Maps a raw stored inscription record and sends the approval notification. Never throws. */
export async function notifyApprovalForRawRecord(raw: Record<string, unknown>) {
  try {
    const user = (raw.user as Record<string, unknown>) || {};
    const profile = (raw.profile as Record<string, unknown>) || {};
    const email = typeof user.email === 'string' ? user.email : '';
    if (!email) return;

    await notifyProjectApproval({
      id: typeof raw.id === 'string' ? raw.id : '',
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
      user: { email },
      profile: {
        name: typeof profile.name === 'string' ? profile.name : '',
        email,
        phone: typeof profile.phone === 'string' ? profile.phone : undefined,
        organization: typeof profile.organization === 'string' ? profile.organization : undefined,
        city: typeof profile.city === 'string' ? profile.city : undefined,
        interest: typeof profile.interest === 'string' ? profile.interest : undefined,
        message: typeof profile.message === 'string' ? profile.message : undefined,
        locale: typeof profile.locale === 'string' ? profile.locale : undefined,
      },
    });
  } catch (error) {
    console.error('[project-approval-notify] failed to notify for raw record:', error);
  }
}
