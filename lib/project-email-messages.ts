import { PROJECT_NAME } from '@/lib/project-brand';
import type { ProjectEmailContent } from '@/lib/project-email';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function localeKey(locale?: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function siteBaseUrl() {
  return (process.env.PROJETO_SITE_URL?.trim() || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
}

export function convenioUrl(locale?: string) {
  return `${siteBaseUrl()}/${localeKey(locale)}/projeto/convenio`;
}

export function profileUrl(locale?: string) {
  return `${siteBaseUrl()}/${localeKey(locale)}/perfil`;
}

/** Transactional email when the team approves a candidate profile. */
export function buildApprovalEmailContent(
  recipientName: string,
  locale?: string
): ProjectEmailContent {
  const key = localeKey(locale);

  const copy = {
    es: {
      subject: 'Tu perfil fue aprobado — firma el convenio del proyecto',
      headline: 'Ya puedes firmar el convenio de participación',
      paragraphs: [
        `Tu inscripción al proyecto ${PROJECT_NAME} fue aprobada.`,
        'El convenio de participación es el documento digital donde constan las reglas del programa: integración a la red, confidencialidad de datos, derechos de imagen, compromiso operativo y autorización de comunicaciones.',
        'Debes firmarlo en línea para desbloquear el diagnóstico de tu emprendimiento.',
      ],
      steps: [
        'Entra con el mismo correo y contraseña que usaste al inscribirte.',
        'Lee el convenio completo (reglas de participación del proyecto).',
        'Marca las 4 casillas de aceptación.',
        'Escribe tu nombre completo y haz clic en «Firmar convenio».',
      ],
      ctaLabel: 'Ir a firmar el convenio',
      footnote: 'Si ya iniciaste sesión en tu perfil, usa el mismo correo y contraseña de la inscripción.',
    },
    'pt-BR': {
      subject: 'Seu perfil foi aprovado — assine o convênio do projeto',
      headline: 'Você já pode assinar o convênio de participação',
      paragraphs: [
        `Sua inscrição no projeto ${PROJECT_NAME} foi aprovada.`,
        'O convênio de participação é o documento digital com as regras do programa: integração à rede, confidencialidade de dados, direitos de imagem, compromisso operacional e autorização de comunicações.',
        'É necessário assiná-lo online para desbloquear o diagnóstico do seu empreendimento.',
      ],
      steps: [
        'Entre com o mesmo e-mail e senha usados na inscrição.',
        'Leia o convênio completo (regras de participação do projeto).',
        'Marque as 4 caixas de aceite.',
        'Escreva seu nome completo e clique em «Assinar convênio».',
      ],
      ctaLabel: 'Ir assinar o convênio',
      footnote: 'Se já entrou no seu perfil, use o mesmo e-mail e senha da inscrição.',
    },
    en: {
      subject: 'Your profile was approved — sign the project agreement',
      headline: 'You can now sign the participation agreement',
      paragraphs: [
        `Your application to ${PROJECT_NAME} was approved.`,
        'The participation agreement is the digital document with the program rules: network membership, data confidentiality, image rights, operational commitment and communications authorization.',
        'You must sign it online to unlock your business diagnosis.',
      ],
      steps: [
        'Log in with the same email and password you used to apply.',
        'Read the full agreement (project participation rules).',
        'Check all 4 acceptance boxes.',
        'Type your full name and click «Sign agreement».',
      ],
      ctaLabel: 'Go sign the agreement',
      footnote: 'If you are already logged into your profile, use the same application email and password.',
    },
  } as const;

  const t = copy[key];
  return {
    locale: key,
    recipientName,
    subject: t.subject,
    headline: t.headline,
    paragraphs: [...t.paragraphs],
    steps: [...t.steps],
    ctaLabel: t.ctaLabel,
    ctaUrl: convenioUrl(key),
    footnote: t.footnote,
  };
}

/** Wraps a team broadcast message in the project email layout. */
export function buildBroadcastEmailContent(
  recipientName: string,
  subject: string,
  body: string,
  link: string,
  locale?: string
): ProjectEmailContent {
  const key = localeKey(locale);
  const paragraphs = body
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ctaLabel =
    key === 'en' ? 'Open project page' : key === 'pt-BR' ? 'Abrir página do projeto' : 'Abrir página del proyecto';

  return {
    locale: key,
    recipientName,
    subject,
    headline: subject,
    paragraphs: paragraphs.length ? paragraphs : [body.trim()],
    ctaLabel,
    ctaUrl: link,
    footnote:
      key === 'en'
        ? `Message from ${PROJECT_NAME} / Rural Commerce.`
        : key === 'pt-BR'
          ? `Mensagem do projeto ${PROJECT_NAME} / Rural Commerce.`
          : `Mensaje del proyecto ${PROJECT_NAME} / Rural Commerce.`,
  };
}
