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

export function diagnosticoUrl(locale?: string) {
  return `${siteBaseUrl()}/${localeKey(locale)}/projeto/diagnostico`;
}

const projectContextParagraph = (recipientName: string) =>
  `Hola ${recipientName}, te escribimos desde Rural Commerce, organización ejecutora del proyecto Impulso MiPyMEs: digitaliza Los Santos. Este programa acompaña a micro, pequeñas y medianas empresas agroalimentarias rurales de la región de Los Santos (Costa Rica) en capacidades empresariales, financieras y digitales, con enfoque en trazabilidad, innovación y acceso a mercados. Tu participación ya fue aprobada. Este mensaje es un recordatorio para que completes la siguiente etapa oficial de tu proceso dentro del programa.`;

/** Spanish reminder when agreement is still unsigned (approved participants). */
export function buildConvenioReminderEmailContent(recipientName: string): ProjectEmailContent {
  return {
    locale: 'es',
    recipientName,
    subject: 'Recordatorio · Rural Commerce: firma tu convenio para continuar en el proyecto',
    headline: 'Firma tu convenio de participación para activar tu lugar en el proyecto',
    paragraphs: [
      projectContextParagraph(recipientName),
      'En este momento tu perfil está aprobado, pero aún no registramos la firma electrónica de tu convenio de participación. Este documento es obligatorio: formaliza tu ingreso al programa y establece las reglas de participación (integración a la red, confidencialidad de datos, derechos de imagen, compromiso operativo y autorización de comunicaciones oficiales).',
      'Sin la firma del convenio no podrás acceder al diagnóstico de tu emprendimiento, que es la siguiente etapa del proceso. Completar este paso solo toma unos minutos si sigues la guía de abajo.',
    ],
    steps: [
      'Entra a la plataforma del proyecto: abre el botón de este correo o visita ruralcommerceglobal.com/es/projeto/convenio.',
      'Inicia sesión con el mismo correo electrónico y contraseña que registraste al inscribirte. Si no recuerdas la contraseña, usa la opción de recuperación desde la página de acceso.',
      'Lee el convenio completo. En la pantalla verás el texto oficial del convenio de participación del proyecto Impulso MiPyMEs.',
      'Marca las 4 casillas de aceptación: participación en la red, derechos de imagen, compromiso operativo y autorización de comunicaciones.',
      'Escribe tu nombre completo en el campo indicado y pulsa «Firmar convenio».',
      'Confirma que quedó registrado. Desde tu perfil podrás descargar una copia en PDF del convenio firmado y continuar con el diagnóstico.',
    ],
    ctaLabel: 'Ir a firmar el convenio',
    ctaUrl: convenioUrl('es'),
    footnote:
      'Este es un mensaje oficial del proyecto Impulso MiPyMEs: digitaliza Los Santos, ejecutado por Rural Commerce. Si tienes dificultades técnicas para entrar o firmar, responde a este correo o contacta al equipo del proyecto y te ayudaremos.',
  };
}

/** Spanish reminder when diagnosis is still pending (agreement signed). */
export function buildDiagnosisReminderEmailContent(recipientName: string): ProjectEmailContent {
  return {
    locale: 'es',
    recipientName,
    subject: 'Recordatorio · Rural Commerce: completa tu diagnóstico empresarial',
    headline: 'Completa tu diagnóstico para que el equipo pueda acompañarte',
    paragraphs: [
      projectContextParagraph(recipientName),
      'Ya registramos la firma de tu convenio de participación. ¡Gracias por completar ese paso! Ahora falta la etapa de diagnóstico: un formulario en línea que nos permite conocer en detalle tu emprendimiento, su nivel de madurez productiva, comercial y tecnológica, y definir el acompañamiento más adecuado dentro del programa.',
      'El diagnóstico es confidencial y la información que compartas será utilizada por Rural Commerce y el equipo técnico del proyecto únicamente para fines de acompañamiento, articulación en red y reportes agregados del programa. Te pedimos completarlo lo antes posible para no retrasar tu proceso.',
    ],
    steps: [
      'Entra a la plataforma: abre el botón de este correo o visita ruralcommerceglobal.com/es/projeto/diagnostico.',
      'Inicia sesión con el mismo correo y contraseña de tu inscripción.',
      'Revisa que tu convenio esté firmado. El diagnóstico solo se habilita para participantes aprobados con convenio firmado.',
      'Responde todas las secciones del formulario. Avanza sección por sección con los botones «Siguiente» y «Anterior».',
      'Responde con la mayor precisión posible. Usa datos reales de tu operación actual.',
      'En la última pantalla, confirma que todas las preguntas obligatorias están completas y pulsa «Enviar diagnóstico».',
      'Consulta tu estado en cualquier momento desde tu perfil en ruralcommerceglobal.com/es/perfil.',
    ],
    ctaLabel: 'Ir al diagnóstico',
    ctaUrl: diagnosticoUrl('es'),
    footnote:
      'Mensaje oficial del proyecto Impulso MiPyMEs: digitaliza Los Santos, ejecutado por Rural Commerce. Si necesitas ayuda para completar el formulario, escríbenos y coordinamos el acompañamiento.',
  };
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
