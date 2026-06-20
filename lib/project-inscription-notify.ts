import { Resend } from 'resend';

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

function adminUrl(locale?: string) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return `https://ruralcommerceglobal.com/${key}/admin`;
}

function buildEmailText(record: InscriptionNotifyRecord) {
  const profile = record.profile;
  const locale = profile.locale || 'es';

  return [
    'Nova inscrição no projeto Impulsa CR / Rural Commerce',
    '',
    `ID: ${record.id}`,
    `Data: ${record.createdAt}`,
    `Idioma: ${locale}`,
    '',
    `Nome: ${profile.name}`,
    `E-mail: ${record.user.email}`,
    `Telefone: ${profile.phone || '—'}`,
    `Organização / empreendimento: ${profile.organization || '—'}`,
    `Cidade: ${profile.city || '—'}`,
    `Interesse / atividade: ${profile.interest || '—'}`,
    '',
    'Mensagem:',
    profile.message || '—',
    '',
    `Painel da equipe: ${adminUrl(locale)}`,
  ].join('\n');
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
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: record.user.email,
    subject: `[Impulsa CR] Nova inscrição — ${subjectName}`,
    text: buildEmailText(record),
  });

  if (error) {
    console.error('[project-inscription-notify] Resend error:', error);
  }
}
