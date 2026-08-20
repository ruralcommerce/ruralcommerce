import { Resend } from 'resend';
import { PROJECT_NAME, projectSiteBaseUrl } from '@/lib/project-brand';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function localeKey(locale?: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    subject: 'Invitación al intranet del equipo',
    headline: 'Completa tu acceso al equipo',
    paragraphs: [
      `Fuiste invitado a la intranet del proyecto ${PROJECT_NAME}.`,
      'Usa el enlace para escribir tu nombre completo y crear la contraseña con la que vas a entrar.',
      'El enlace es válido por 7 días.',
    ],
    ctaLabel: 'Crear mi acceso',
  },
  'pt-BR': {
    subject: 'Convite para a intranet da equipe',
    headline: 'Conclua seu acesso da equipe',
    paragraphs: [
      `Você foi convidado para a intranet do projeto ${PROJECT_NAME}.`,
      'Use o link para informar seu nome completo e criar a senha com a qual vai entrar.',
      'O link é válido por 7 dias.',
    ],
    ctaLabel: 'Criar meu acesso',
  },
  en: {
    subject: 'Invitation to the team intranet',
    headline: 'Finish setting up your team access',
    paragraphs: [
      `You were invited to the ${PROJECT_NAME} team intranet.`,
      'Use the link to enter your full name and create the password you will use to sign in.',
      'The link is valid for 7 days.',
    ],
    ctaLabel: 'Create my access',
  },
} as const;

export function teamInviteUrl(locale: string, token: string) {
  return `${projectSiteBaseUrl()}/${localeKey(locale)}/admin/convite?token=${encodeURIComponent(token)}`;
}

export async function sendTeamInviteEmail(input: { email: string; token: string; locale?: string }) {
  const locale = localeKey(input.locale);
  const t = copy[locale];
  const inviteUrl = teamInviteUrl(locale, input.token);
  const content = {
    locale,
    subject: t.subject,
    headline: t.headline,
    paragraphs: [...t.paragraphs],
    ctaLabel: t.ctaLabel,
    ctaUrl: inviteUrl,
  };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.warn('[team-invite] Resend not configured — invite saved but email skipped');
    return { sent: false as const, inviteUrl };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [input.email],
    subject: `[${PROJECT_NAME}] ${t.subject}`,
    text: buildProjectEmailText(content),
    html: buildProjectEmailHtml(content),
  });

  if (error) {
    console.error('[team-invite] Resend error:', error);
    return { sent: false as const, inviteUrl };
  }

  return { sent: true as const, inviteUrl };
}
