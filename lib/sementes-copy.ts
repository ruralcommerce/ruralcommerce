import type { SementeLocale } from '@/lib/sementes-types';

type Copy = {
  brand: string;
  saveNow: string;
  saving: string;
  saved: string;
  next: string;
  back: string;
  skip: string;
  welcomeKicker: string;
  welcomeTitle: string;
  welcomeText: string;
  nameLabel: string;
  namePlaceholder: string;
  whatsappLabel: string;
  whatsappPlaceholder: string;
  pinLabel: string;
  pinHint: string;
  plantCta: string;
  pathTitle: string;
  pathText: string;
  produto: string;
  produtoHint: string;
  servico: string;
  servicoHint: string;
  problemTitle: string;
  problemHint: string;
  problemPlaceholder: string;
  solutionTitle: string;
  solutionHint: string;
  solutionPlaceholder: string;
  impactTitle: string;
  impactHint: string;
  economico: string;
  ambiental: string;
  social: string;
  impactNoteLabel: string;
  impactPlaceholder: string;
  fuelTitle: string;
  fuelHint: string;
  fuelPlaceholder: string;
  fuelChips: string[];
  recordTitle: string;
  recordHint: string;
  recordCta: string;
  recordAgain: string;
  recordUse: string;
  recordSkip: string;
  recordUploading: string;
  recordNeedCam: string;
  recordFallback: string;
  flipSoon: string;
  doneTitle: string;
  doneText: string;
  seePalco: string;
  mySeed: string;
  palcoTitle: string;
  palcoEmpty: string;
  palcoCount: string;
  fire: string;
  cartaTitle: string;
  entrarTitle: string;
  entrarText: string;
  entrarCta: string;
  exportPng: string;
  exportVideo: string;
  editSeed: string;
  mesaTitle: string;
  mesaPassword: string;
  mesaEnter: string;
  mesaFlip: string;
  mentorship: string;
  shortlist: string;
  wait: string;
  anonymousNote: string;
  timerLabel: string;
  pressStart: string;
  missionTag: string;
  playerSetup: string;
  playerSetupText: string;
  guideName: string;
  resumeSeed: string;
};

const pt: Copy = {
  brand: 'Sementes da Inovação',
  saveNow: 'salvo agora',
  saving: 'salvando…',
  saved: 'tá salvo',
  next: 'seguir',
  back: 'voltar',
  skip: 'pular',
  welcomeKicker: 'Rural Commerce',
  welcomeTitle: 'Planta tua semente.',
  welcomeText:
    '15 minutos. Uma ideia. No telão ninguém vê teu nome — só o negócio. Responde rápido. Intuição vale mais que redação.',
  nameLabel: 'Como te chamam?',
  namePlaceholder: 'Escreve aqui',
  whatsappLabel: 'Qual WhatsApp te acha?',
  whatsappPlaceholder: 'Só para a mentoria',
  pinLabel: 'Cria teu código secreto',
  pinHint: '4 números. Para voltar noutro celular.',
  plantCta: 'Plantar agora',
  pathTitle: 'Escolhe o caminho',
  pathText: 'Um toque. A ou B. Dá para mudar depois.',
  produto: 'Produto',
  produtoHint: 'Leva, prova, usa.',
  servico: 'Serviço',
  servicoHint: 'Consulta, visita, know-how.',
  problemTitle: 'O que está quebrado por aqui?',
  problemHint: 'Pensa em algo que as pessoas pagariam para ver resolvido.',
  problemPlaceholder: 'Ex.: goiaba madura vai pro chão porque não tem quem processe.',
  solutionTitle: 'Como a tua ideia resolve isso?',
  solutionHint: 'Uma frase. O que você faz que o vizinho não faz.',
  solutionPlaceholder: 'Ex.: transformo o excedente em snack com a história do sítio no QR.',
  impactTitle: 'Tua semente alimenta o quê?',
  impactHint: 'Toca nos orbes que forem verdade. Depois uma linha.',
  economico: 'Renda',
  ambiental: 'Terra',
  social: 'Gente',
  impactNoteLabel: 'Como isso acontece?',
  impactPlaceholder: 'Ex.: pago melhor o vizinho e deixo de jogar fruta fora.',
  fuelTitle: 'Para testar amanhã de manhã?',
  fuelHint: 'Seja realista. O mínimo para o primeiro teste.',
  fuelPlaceholder: 'Ex.: R$ 180, panela e o celular.',
  fuelChips: ['celular', 'WhatsApp', 'R$ 50', 'R$ 200', 'moto', '2 amigos', '1 dia', 'ferramentas'],
  recordTitle: 'Vira a carta.',
  recordHint: '15 segundos. Olha pra câmera e conta a ideia. Pode repetir até curtir.',
  recordCta: 'Gravar o verso',
  recordAgain: 'Gravar de novo',
  recordUse: 'Usar esse',
  recordSkip: 'Mandar sem vídeo',
  recordUploading: 'Subindo teu verso…',
  recordNeedCam: 'Precisa da câmera. Se bloquear, libera nas configurações.',
  recordFallback: 'Ou escolhe um vídeo da galeria (vertical, curto).',
  flipSoon: 'Todo mundo vira agora',
  doneTitle: 'Semente no palco.',
  doneText: 'Teu nome ficou fora da tela. A ideia entrou. Dá para editar, regravar e exportar na tua área.',
  seePalco: 'Ver o canteiro',
  mySeed: 'Minha semente',
  palcoTitle: 'Canteiro ao vivo',
  palcoEmpty: 'Ainda não caiu nenhuma semente. O primeiro que plantar abre o palco.',
  palcoCount: 'sementes no ar',
  fire: 'fogo',
  cartaTitle: 'Tua semente',
  entrarTitle: 'Entrar na tua semente',
  entrarText: 'WhatsApp e o PIN de 4 dígitos que você criou no começo.',
  entrarCta: 'Abrir',
  exportPng: 'Baixar a carta',
  exportVideo: 'Baixar o verso',
  editSeed: 'Continuar editando',
  mesaTitle: 'Mesa Sementes',
  mesaPassword: 'Senha da equipe',
  mesaEnter: 'Entrar na mesa',
  mesaFlip: 'Disparar o verso agora',
  mentorship: 'Mentoria',
  shortlist: 'Pré-lista',
  wait: 'Espera',
  anonymousNote: 'No palco: sem nome, sem foto, sem WhatsApp.',
  timerLabel: 'missão',
  pressStart: 'Toque para começar',
  missionTag: 'Missão · 15 minutos',
  playerSetup: 'Crie teu perfil',
  playerSetupText: 'No palco você vira um codinome. Nome e Zap ficam só com a gente.',
  guideName: 'Guia',
  resumeSeed: 'Já plantei',
};

const es: Copy = {
  ...pt,
  welcomeTitle: 'Planta tu semilla.',
  welcomeText:
    '15 minutos. Una idea. En la pantalla nadie ve tu nombre — solo el negocio. Responde rápido. La intuición vale más que la redacción.',
  nameLabel: '¿Cómo te dicen?',
  namePlaceholder: 'Escribe aquí',
  whatsappLabel: '¿Qué WhatsApp te encuentra?',
  whatsappPlaceholder: 'Solo para la mentoría',
  pinLabel: 'Crea tu código secreto',
  pinHint: '4 números. Para volver en otro celular.',
  plantCta: 'Plantar ahora',
  pathTitle: 'Elige el camino',
  pathText: 'Un toque. A o B. Se puede cambiar después.',
  produto: 'Producto',
  produtoHint: 'Lleva, prueba, usa.',
  servico: 'Servicio',
  servicoHint: 'Consulta, visita, know-how.',
  problemTitle: '¿Qué está roto por aquí?',
  problemHint: 'Piensa en algo que la gente pagaría por ver resuelto.',
  problemPlaceholder: 'Ej.: la guayaba madura se cae porque nadie la procesa.',
  solutionTitle: '¿Cómo lo resuelve tu idea?',
  solutionHint: 'Una frase. Lo que haces distinto a tu vecino.',
  solutionPlaceholder: 'Ej.: transformo el excedente en snack con la historia del sitio en el QR.',
  impactTitle: '¿Qué alimenta tu semilla?',
  impactHint: 'Toca lo que sea verdad. Después explícalo en una línea.',
  economico: 'Renta',
  ambiental: 'Tierra',
  social: 'Gente',
  impactNoteLabel: '¿Cómo pasa?',
  impactPlaceholder: 'Ej.: pago mejor al vecino y dejo de tirar fruta.',
  fuelTitle: '¿Para probar mañana por la mañana?',
  fuelHint: 'Sé realista. El mínimo para el primer test.',
  fuelPlaceholder: 'Ej.: $180, una olla y el celular.',
  fuelChips: ['celular', 'WhatsApp', '$50', '$200', 'moto', '2 amigos', '1 día', 'herramientas'],
  recordTitle: 'Voltea la carta.',
  recordHint: '15 segundos. Mira a cámara y cuenta la idea. Puedes repetir.',
  recordCta: 'Grabar el reverso',
  recordAgain: 'Grabar otra vez',
  recordUse: 'Usar este',
  recordSkip: 'Enviar sin video',
  recordUploading: 'Subiendo tu reverso…',
  recordNeedCam: 'Necesita la cámara. Si se bloquea, actívala en ajustes.',
  recordFallback: 'O elige un video de la galería (vertical, corto).',
  flipSoon: 'Todo el mundo voltea ahora',
  doneTitle: 'Semilla en el palco.',
  doneText: 'Tu nombre quedó fuera de la pantalla. La idea entró. Puedes editar, grabar de nuevo y exportar.',
  seePalco: 'Ver el cantero',
  mySeed: 'Mi semilla',
  palcoTitle: 'Cantero en vivo',
  palcoEmpty: 'Todavía no cayó ninguna semilla. Quien plante primero abre el palco.',
  palcoCount: 'semillas en el aire',
  fire: 'fuego',
  cartaTitle: 'Tu semilla',
  entrarTitle: 'Entrar a tu semilla',
  entrarText: 'WhatsApp y el PIN de 4 dígitos que creaste al inicio.',
  entrarCta: 'Abrir',
  exportPng: 'Bajar la carta',
  exportVideo: 'Bajar el reverso',
  editSeed: 'Seguir editando',
  mesaTitle: 'Mesa Sementes',
  mesaPassword: 'Clave del equipo',
  mesaEnter: 'Entrar a la mesa',
  mesaFlip: 'Disparar el reverso ahora',
  mentorship: 'Mentoría',
  shortlist: 'Prelista',
  wait: 'Espera',
  anonymousNote: 'En el palco: sin nombre, sin foto, sin WhatsApp.',
  timerLabel: 'misión',
  pressStart: 'Toca para empezar',
  missionTag: 'Misión · 15 minutos',
  playerSetup: 'Crea tu perfil',
  playerSetupText: 'En el palco eres un alias. Nombre y Zap quedan solo con el equipo.',
  guideName: 'Guía',
  resumeSeed: 'Ya planté',
  next: 'seguir',
  back: 'volver',
  skip: 'saltar',
  saveNow: 'guardado ahora',
  saving: 'guardando…',
  saved: 'quedó guardado',
};

const en: Copy = {
  ...pt,
  welcomeTitle: 'Plant your seed.',
  welcomeText:
    '15 minutes. One idea. On the big screen nobody sees your name — only the business. Go fast. Instinct beats an essay.',
  nameLabel: 'What should we call you?',
  namePlaceholder: 'Type here',
  whatsappLabel: 'Which WhatsApp finds you?',
  pinLabel: 'Create your secret code',
  pinHint: '4 digits. So you can come back on another phone.',
  plantCta: 'Plant now',
  pathTitle: 'Pick your path',
  pathText: 'One tap. A or B. You can change later.',
  produto: 'Product',
  produtoHint: 'Take, taste, use.',
  servico: 'Service',
  servicoHint: 'Visit, consult, know-how.',
  economico: 'Income',
  ambiental: 'Land',
  social: 'People',
  guideName: 'Guide',
  resumeSeed: 'I already planted',
  problemTitle: 'What is broken around here?',
  solutionTitle: 'How does your idea fix that?',
  recordTitle: 'Flip the card.',
  doneTitle: 'Seed on stage.',
  palcoTitle: 'Live seedbed',
  cartaTitle: 'Your seed',
  mesaTitle: 'Sementes desk',
  pressStart: 'Tap to start',
  missionTag: 'Mission · 15 minutes',
  playerSetup: 'Create your profile',
  playerSetupText: 'On stage you become an alias. Name and WhatsApp stay with the team.',
};

export function sementesCopy(locale: string): Copy {
  if (locale === 'pt-BR') return pt;
  if (locale === 'en') return en;
  return es;
}

export function sementesLocale(locale: string): SementeLocale {
  if (locale === 'pt-BR' || locale === 'en') return locale;
  return 'es';
}
