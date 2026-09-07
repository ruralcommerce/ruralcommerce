import { Resend } from 'resend';
import { sendDirectProjectMessage, type BroadcastRecipient } from '@/lib/project-broadcast';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { PROJECT_EXECUTOR, PROJECT_NAME } from '@/lib/project-brand';
import { readTeamMembers } from '@/lib/project-team-members';
import {
  inscriptionEmail,
  inscriptionProfile,
  isApprovedWithAgreement,
  readInscriptionRecords,
  type InscriptionRecord,
} from '@/lib/project-candidate-auth';
import {
  indicatorUsd,
  inMonth,
  monthKey,
  type InvestmentRecord,
} from '@/lib/project-investments';

const DEFAULT_NOTIFY_EMAILS = [
  'operations@ruralcommerceglobal.com',
  'tiagorezende@ruralcommerceglobal.com',
  'pablogonzalez@ruralcommerceglobal.com',
] as const;

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

function adminInvestmentsUrl() {
  return `${siteBaseUrl()}/es/admin`;
}

function beneficiaryInvestmentsPath(locale?: string) {
  return `/${localeKeyOf(locale)}/projeto/inversiones`;
}

export async function listInvestmentTeamEmails() {
  const configured = parseNotifyEmails(process.env.PROJETO_INSCRIPTION_NOTIFY_EMAILS);
  const members = await readTeamMembers();
  const memberEmails = members.filter((member) => member.active && member.email).map((member) => member.email);
  return Array.from(new Set([...configured, ...memberEmails].map((email) => email.toLowerCase())));
}

function participantSummary(record: InscriptionRecord) {
  const profile = inscriptionProfile(record);
  return {
    id: typeof record.id === 'string' ? record.id : '',
    name: typeof profile.name === 'string' ? profile.name : '',
    organization: typeof profile.organization === 'string' ? profile.organization : '',
    email: inscriptionEmail(record),
    phone: typeof profile.phone === 'string' ? profile.phone : '',
    locale: typeof profile.locale === 'string' ? profile.locale : 'es',
  };
}

export async function notifyTeamInvestmentSubmitted(input: {
  investment: InvestmentRecord;
  participant: InscriptionRecord;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return;

  const to = await listInvestmentTeamEmails();
  if (!to.length) return;

  const person = participantSummary(input.participant);
  const amount =
    typeof input.investment.amountOriginal === 'number'
      ? `${input.investment.currency || 'CRC'} ${input.investment.amountOriginal}`
      : 'monto por confirmar';
  const paragraphs = [
    `${person.name || person.email} firmó y envió una inversión con comprobante.`,
    `Organización: ${person.organization || '—'}`,
    `Monto declarado: ${amount}`,
    `Comprobantes: ${input.investment.files.filter((file) => file.kind === 'receipt').length}`,
    'Revisen las fotos y acepten el monto en USD para el indicador 18a.',
  ];
  const content = {
    locale: 'es',
    recipientName: PROJECT_EXECUTOR,
    subject: `[${PROJECT_NAME}] Nueva inversión firmada — ${person.organization || person.name}`,
    headline: 'Nueva inversión para revisar',
    paragraphs,
    ctaLabel: 'Abrir intranet',
    ctaUrl: adminInvestmentsUrl(),
    footnote: `ID: ${input.investment.id}`,
  };

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: person.email || undefined,
    subject: content.subject,
    text: buildProjectEmailText(content),
    html: buildProjectEmailHtml(content),
  });
  if (error) console.error('[investment-notify] submit email failed:', error);
}

export type InvestmentDigestResult = {
  month: string;
  silentCount: number;
  submittedCount: number;
  acceptedUsd: number;
  teamEmails: number;
  beneficiaryReminders: number;
};

export async function buildInvestmentDigest(month: string, investments: InvestmentRecord[]) {
  const inscriptions = await readInscriptionRecords();
  const eligible = inscriptions.filter(isApprovedWithAgreement).map(participantSummary);
  const submittedThisMonth = investments.filter(
    (item) => item.status !== 'draft' && (inMonth(item.submittedAt, month) || inMonth(item.updatedAt, month))
  );
  const submittedIds = new Set(submittedThisMonth.map((item) => item.participantId));
  const silent = eligible.filter((person) => person.id && !submittedIds.has(person.id));
  const acceptedUsd = Math.round(
    investments.reduce((sum, item) => sum + indicatorUsd(item), 0) * 100
  ) / 100;

  return { eligible, silent, submittedThisMonth, acceptedUsd };
}

export async function sendInvestmentMonthlyDigest(options?: { month?: string; remindBeneficiaries?: boolean }) {
  const { readInvestments } = await import('@/lib/project-investments');
  const month = options?.month || monthKey();
  const investments = await readInvestments();
  const digest = await buildInvestmentDigest(month, investments);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = await listInvestmentTeamEmails();

  if (apiKey && from && to.length) {
    const submittedLines = digest.submittedThisMonth.slice(0, 40).map((item) => {
      const who = digest.eligible.find((person) => person.id === item.participantId);
      const label = who?.organization || who?.name || item.participantId;
      const usd = item.amountUsdEstimated != null ? `USD ${item.amountUsdEstimated}` : 'sin USD';
      return `${label} — ${item.status} — ${usd}`;
    });
    const silentLines = digest.silent.slice(0, 60).map((person) => person.organization || person.name || person.email);
    const paragraphs = [
      `Informe mensual de inversiones (indicador 18a) — ${month}.`,
      `No reportaron este mes: ${digest.silent.length} beneficiarios.`,
      silentLines.length ? `Sin envío: ${silentLines.join('; ')}` : 'Todos los elegibles reportaron algo este mes.',
      `Sí enviaron este mes: ${digest.submittedThisMonth.length} fichas.`,
      submittedLines.length ? `Enviadas: ${submittedLines.join(' | ')}` : 'Nadie envió fichas este mes.',
      `Total aceptado para 18a (acumulado): USD ${digest.acceptedUsd.toFixed(2)}.`,
    ];
    const content = {
      locale: 'es',
      recipientName: PROJECT_EXECUTOR,
      subject: `[${PROJECT_NAME}] Inversiones ${month}: ${digest.silent.length} en silencio, ${digest.submittedThisMonth.length} enviadas`,
      headline: `Inversiones ${month}`,
      paragraphs,
      ctaLabel: 'Abrir intranet',
      ctaUrl: adminInvestmentsUrl(),
    };
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: content.subject,
      text: buildProjectEmailText(content),
      html: buildProjectEmailHtml(content),
    });
    if (error) console.error('[investment-digest] team email failed:', error);
  }

  let beneficiaryReminders = 0;
  if (options?.remindBeneficiaries !== false) {
    for (const person of digest.silent) {
      if (!person.email) continue;
      const locale = localeKeyOf(person.locale);
      const recipient: BroadcastRecipient = {
        id: person.id,
        email: person.email,
        phone: person.phone,
        name: person.name,
        locale,
      };
      const copy =
        locale === 'pt-BR'
          ? {
              subject: 'Conte uma compra do seu negócio',
              body: 'Se este mês você comprou ou melhorou algo no negócio, entre e envie a fatura ou recibo. Sem o papel não podemos registrar o investimento.',
              cta: 'Enviar comprovante',
            }
          : locale === 'en'
            ? {
                subject: 'Tell us about a purchase for your business',
                body: 'If you bought or improved something this month, sign in and upload the invoice or receipt. Without that document we cannot record the investment.',
                cta: 'Upload receipt',
              }
            : {
                subject: 'Cuéntanos una compra de tu negocio',
                body: 'Si este mes compraste o mejoraste algo en tu negocio, entra y sube la factura o el recibo. Sin ese papel no podemos registrar la inversión.',
                cta: 'Subir comprobante',
              };
      const emailContent = {
        locale,
        recipientName: person.name,
        subject: copy.subject,
        headline: copy.subject,
        paragraphs: [copy.body],
        ctaLabel: copy.cta,
        ctaUrl: `${siteBaseUrl()}${beneficiaryInvestmentsPath(locale)}`,
      };
      try {
        await sendDirectProjectMessage(
          recipient,
          {
            subject: copy.subject,
            body: copy.body,
            pushTitle: copy.subject,
            pushBody: copy.body,
            link: beneficiaryInvestmentsPath(locale),
            html: buildProjectEmailHtml(emailContent),
          },
          ['email', 'push', 'whatsapp']
        );
        beneficiaryReminders += 1;
      } catch (error) {
        console.error('[investment-digest] beneficiary reminder failed:', person.email, error);
      }
    }
  }

  return {
    month,
    silentCount: digest.silent.length,
    submittedCount: digest.submittedThisMonth.length,
    acceptedUsd: digest.acceptedUsd,
    teamEmails: to.length,
    beneficiaryReminders,
  } satisfies InvestmentDigestResult;
}
