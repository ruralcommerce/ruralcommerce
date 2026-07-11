import { Resend } from 'resend';
import { sendDirectProjectMessage } from '@/lib/project-broadcast';
import { PROJECT_NAME } from '@/lib/project-brand';

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

const approvalCopy = {
  es: {
    subject: 'Tu perfil fue aprobado — firma el convenio para continuar',
    body: [
      `¡Buenas noticias! Tu perfil fue aprobado para el proyecto ${PROJECT_NAME}.`,
      '',
      'Para integrarte a la red y acceder a los beneficios del programa, tu próximo paso es firmar el convenio de participación y compromiso (red, confidencialidad de datos, derechos de imagen y participación activa).',
      '',
      'Una vez firmado, podrás completar el diagnóstico.',
    ].join('\n'),
    pushBody: 'Perfil aprobado. Firma el convenio para integrarte a la red y continuar.',
  },
  'pt-BR': {
    subject: 'Seu perfil foi aprovado — assine o convênio para continuar',
    body: [
      `Boas notícias! Seu perfil foi aprovado para o projeto ${PROJECT_NAME}.`,
      '',
      'Para integrar a rede e acessar os benefícios do programa, seu próximo passo é assinar o convênio de participação e compromisso (rede, confidencialidade de dados, direitos de imagem e participação ativa).',
      '',
      'Após assinar, você poderá preencher o diagnóstico.',
    ].join('\n'),
    pushBody: 'Perfil aprovado. Assine o convênio para integrar a rede e continuar.',
  },
  en: {
    subject: 'Your profile was approved — sign the agreement to continue',
    body: [
      `Good news! Your profile was approved for the ${PROJECT_NAME} project.`,
      '',
      'To join the network and access program benefits, your next step is to sign the participation and commitment agreement (network, data confidentiality, image rights and active participation).',
      '',
      'Once signed, you can complete the diagnosis.',
    ].join('\n'),
    pushBody: 'Profile approved. Sign the agreement to join the network and continue.',
  },
} as const;

function buildEmailText(record: InscriptionNotifyRecord) {
  const profile = record.profile;
  const locale = profile.locale || 'es';

  return [
    'Nova inscrição no projeto ' + PROJECT_NAME,
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
    subject: `[${PROJECT_NAME}] Nova inscrição — ${subjectName}`,
    text: buildEmailText(record),
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
  const copy = approvalCopy[locale];
  const candidateEmail = record.user.email;
  if (!candidateEmail) return;

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
        subject: copy.subject,
        body: copy.body,
        pushTitle: copy.subject,
        pushBody: copy.pushBody,
        link: convenioPath(locale),
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
