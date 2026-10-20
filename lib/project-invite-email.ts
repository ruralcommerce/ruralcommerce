import { PROJECT_NAME, PROJECT_NAME_SHORT } from '@/lib/project-brand';
import type { ProjectEmailContent } from '@/lib/project-email';
import { inviteOnboardingUrl } from '@/lib/project-participant-invites';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function localeKey(locale?: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function buildParticipantInviteEmailContent(
  invitedEmail: string,
  token: string,
  locale?: string
): ProjectEmailContent {
  const key = localeKey(locale);
  const ctaUrl = inviteOnboardingUrl(token, key);

  if (key === 'pt-BR') {
    return {
      locale: key,
      subject: `Convite · ${PROJECT_NAME_SHORT}: participe do projeto`,
      headline: `Convidamos você a participar de ${PROJECT_NAME}`,
      paragraphs: [
        `Olá, escrevemos da Rural Commerce, organização executora do projeto ${PROJECT_NAME}.`,
        'O programa acompanha micro, pequenas e médias empresas agroalimentares da região de Los Santos (Costa Rica) no fortalecimento de capacidades empresariais, financeiras e digitais, com foco em rastreabilidade, inovação, economia circular e acesso a mercados.',
        'Convidamos o seu empreendimento a integrar a rede do programa. Para participar, complete um único processo online com estas etapas: cadastro do empreendimento, criação da senha de acesso, assinatura do convênio de participação e diagnóstico empresarial.',
        'Você só fica plenamente integrado ao projeto quando todas as etapas estiverem concluídas. Pode sair e voltar depois: o progresso fica salvo e vinculado a este convite e ao e-mail que usar no cadastro.',
        `Este convite foi enviado para ${invitedEmail}. Se preferir usar outro e-mail no cadastro, pode fazê-lo; o acompanhamento do processo continua vinculado a este convite.`,
      ],
      steps: [
        'Abra o botão deste e-mail para entrar no link pessoal do convite.',
        'Complete o cadastro do empreendimento e crie a sua senha.',
        'Leia e assine o convênio de participação.',
        'Preencha o diagnóstico empresarial.',
        'Ao terminar, o seu lugar no projeto fica ativo e poderá acompanhar tudo pelo perfil.',
      ],
      ctaLabel: 'Aceitar convite e começar',
      ctaUrl,
      footnote: `Mensagem oficial do projeto ${PROJECT_NAME}, executado pela Rural Commerce. Se precisar de ajuda, responda a este e-mail.`,
    };
  }

  if (key === 'en') {
    return {
      locale: key,
      subject: `Invitation · ${PROJECT_NAME_SHORT}: join the project`,
      headline: `You are invited to join ${PROJECT_NAME}`,
      paragraphs: [
        `Hello, we are writing from Rural Commerce, the organization implementing ${PROJECT_NAME}.`,
        'The program supports micro, small and medium agro-food enterprises in the Los Santos region (Costa Rica) by strengthening business, financial and digital capabilities, with a focus on traceability, innovation, circular economy and market access.',
        'We invite your enterprise to join the program network. To participate, complete one online process with these steps: enterprise registration, access password creation, participation agreement signature and business diagnosis.',
        'You are fully part of the project only when every step is complete. You can leave and come back later: progress is saved and linked to this invitation and to the email you use when registering.',
        `This invitation was sent to ${invitedEmail}. If you prefer another email for registration, you may use it; progress remains linked to this invitation.`,
      ],
      steps: [
        'Open the button in this email to enter your personal invitation link.',
        'Complete your enterprise registration and create your password.',
        'Read and sign the participation agreement.',
        'Complete the business diagnosis.',
        'When finished, your place in the project becomes active and you can follow everything from your profile.',
      ],
      ctaLabel: 'Accept invitation and start',
      ctaUrl,
      footnote: `Official message from ${PROJECT_NAME}, implemented by Rural Commerce. If you need help, reply to this email.`,
    };
  }

  return {
    locale: 'es',
    subject: `Invitación · ${PROJECT_NAME_SHORT}: participa en el proyecto`,
    headline: `Te invitamos a participar en ${PROJECT_NAME}`,
    paragraphs: [
      `Hola, te escribimos desde Rural Commerce, organización ejecutora del proyecto ${PROJECT_NAME}.`,
      'El programa acompaña a micro, pequeñas y medianas empresas agroalimentarias de la región de Los Santos (Costa Rica) en el fortalecimiento de capacidades empresariales, financieras y digitales, con foco en trazabilidad, innovación, economía circular y acceso a mercados.',
      'Invitamos a tu emprendimiento a integrarse a la red del programa. Para participar, completa un solo proceso en línea con estas etapas: registro del emprendimiento, creación de tu contraseña de acceso, firma del convenio de participación y diagnóstico empresarial.',
      'Solo quedas plenamente integrado al proyecto cuando todas las etapas estén completas. Puedes salir y volver después: el avance se guarda y queda vinculado a esta invitación y al correo que uses en el registro.',
      `Esta invitación se envió a ${invitedEmail}. Si prefieres usar otro correo en el registro, puedes hacerlo; el seguimiento del proceso sigue vinculado a esta invitación.`,
    ],
    steps: [
      'Abre el botón de este correo para entrar al enlace personal de la invitación.',
      'Completa el registro del emprendimiento y crea tu contraseña.',
      'Lee y firma el convenio de participación.',
      'Completa el diagnóstico empresarial.',
      'Al terminar, tu lugar en el proyecto queda activo y podrás seguirlo desde tu perfil.',
    ],
    ctaLabel: 'Aceptar invitación y comenzar',
    ctaUrl,
    footnote: `Mensaje oficial del proyecto ${PROJECT_NAME}, ejecutado por Rural Commerce. Si necesitas ayuda, responde a este correo.`,
  };
}
