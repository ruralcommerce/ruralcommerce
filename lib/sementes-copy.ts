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
  whyClose: string;
  infoAria: string;
  nameInfo: string;
  whatsappInfo: string;
  pinInfo: string;
  pathInfo: string;
  problemInfo: string;
  solutionInfo: string;
  impactInfo: string;
  fuelInfo: string;
  recordInfo: string;
  doneInfo: string;
  economicoHint: string;
  ambientalHint: string;
  socialHint: string;
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
  problemTitle: 'Qual problema ou necessidade a tua ideia resolve?',
  problemHint: 'Em uma frase. Sem rodeio.',
  problemPlaceholder: 'Ex.: goiaba madura vai pro chão porque não tem quem processe.',
  solutionTitle: 'Como a tua ideia resolve isso?',
  solutionHint: 'Uma frase. O que você faz que o vizinho não faz.',
  solutionPlaceholder: 'Ex.: transformo o excedente em snack com a história do sítio no QR.',
  impactTitle: 'Que impacto a tua ideia gera?',
  impactHint: 'Marca o que for verdade. Depois explica em uma linha.',
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
  whyClose: 'Entendi',
  infoAria: 'Por que esta pergunta',
  nameInfo: 'É o teu nome, só para a equipe. No telão aparece um apelido — ninguém lê o teu nome.',
  whatsappInfo: 'Para a equipe te chamar se a ideia for selecionada. Não aparece no palco.',
  pinInfo: 'Quatro números para abrir tua semente noutro celular. Guarda. Sem o PIN, não entra de novo.',
  pathInfo:
    'Produto: algo que a pessoa leva, prova ou usa. Serviço: visita, consulta ou fazer por alguém. Escolhe o que mais parece tua ideia. Dá para mudar depois.',
  problemInfo:
    'Queremos o problema ou a necessidade que a ideia ataca. Exemplo: fruta madura vai embora porque ninguém processa.',
  solutionInfo: 'Agora diz como a ideia resolve aquele problema. O que você faz, na prática, que o vizinho não faz.',
  impactInfo:
    'Impacto é o efeito da ideia no mundo. Renda = gera ou melhora dinheiro. Terra = ajuda o ambiente (menos desperdício, mais cuidado). Gente = ajuda pessoas daqui. Podes marcar um, dois ou três. Depois escreve como isso acontece.',
  fuelInfo: 'O mínimo para testar amanhã: dinheiro, ferramenta, gente ou tempo. Não o plano grande — o primeiro passo.',
  recordInfo:
    'Um vídeo de 15 segundos olhando para a câmera, contando a ideia. Fica no verso da carta. Só tu e a equipe veem, se não quiseres mostrar no telão.',
  doneInfo: 'A ideia já está no telão, sem o teu nome. Daqui vês o canteiro ou abres tua carta para editar.',
  economicoHint: 'dinheiro',
  ambientalHint: 'ambiente',
  socialHint: 'pessoas',
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
  problemTitle: '¿Qué problema o necesidad resuelve tu idea?',
  problemHint: 'En una frase. Sin rodeos.',
  problemPlaceholder: 'Ej.: la guayaba madura se cae porque nadie la procesa.',
  solutionTitle: '¿Cómo lo resuelve tu idea?',
  solutionHint: 'Una frase. Lo que haces distinto a tu vecino.',
  solutionPlaceholder: 'Ej.: transformo el excedente en snack con la historia del sitio en el QR.',
  impactTitle: '¿Qué impacto genera tu idea?',
  impactHint: 'Marca lo que sea verdad. Después explícalo en una línea.',
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
  whyClose: 'Entendido',
  infoAria: 'Por qué esta pregunta',
  nameInfo: 'Es tu nombre, solo para el equipo. En la pantalla aparece un alias — nadie lee tu nombre.',
  whatsappInfo: 'Para que el equipo te llame si la idea sale. No aparece en el palco.',
  pinInfo: 'Cuatro números para abrir tu semilla en otro celular. Guárdalos. Sin el PIN, no entras de nuevo.',
  pathInfo:
    'Producto: algo que la persona lleva, prueba o usa. Servicio: visita, consulta o hacer por alguien. Elige lo que más se parece a tu idea. Se puede cambiar después.',
  problemInfo:
    'Queremos el problema o la necesidad que ataca la idea. Ejemplo: la fruta madura se pierde porque nadie la procesa.',
  solutionInfo: 'Ahora di cómo la idea resuelve ese problema. Lo que haces, en la práctica, distinto a tu vecino.',
  impactInfo:
    'Impacto es el efecto de la idea en el mundo. Renta = genera o mejora dinero. Tierra = ayuda al ambiente (menos desperdicio, más cuidado). Gente = ayuda a personas de aquí. Puedes marcar uno, dos o tres. Después escribe cómo pasa.',
  fuelInfo: 'Lo mínimo para probar mañana: dinero, herramienta, gente o tiempo. No el plan grande — el primer paso.',
  recordInfo:
    'Un video de 15 segundos mirando a cámara, contando la idea. Queda en el reverso de la carta. Solo tú y el equipo lo ven, si no quieres mostrarlo.',
  doneInfo: 'La idea ya está en la pantalla, sin tu nombre. Desde aquí ves el cantero o abres tu carta para editar.',
  economicoHint: 'dinero',
  ambientalHint: 'ambiente',
  socialHint: 'personas',
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
  problemTitle: 'What problem or need does your idea solve?',
  problemHint: 'One sentence. No fluff.',
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
  impactTitle: 'What impact does your idea create?',
  impactHint: 'Mark what is true. Then explain in one line.',
  whyClose: 'Got it',
  infoAria: 'Why this question',
  nameInfo: 'Your name is only for the team. On the big screen you get an alias — nobody reads your name.',
  whatsappInfo: 'So the team can reach you if the idea is selected. It never appears on stage.',
  pinInfo: 'Four digits to open your seed on another phone. Keep them. Without the PIN, you cannot come back.',
  pathInfo:
    'Product: something a person takes, tastes, or uses. Service: a visit, consult, or doing work for someone. Pick what your idea is. You can change later.',
  problemInfo:
    'We want the problem or need your idea attacks. Example: ripe fruit is wasted because nobody processes it.',
  solutionInfo: 'Now say how the idea solves that problem. What you actually do that your neighbor does not.',
  impactInfo:
    'Impact is the effect of the idea. Income = makes or improves money. Land = helps the environment (less waste, more care). People = helps people here. You can mark one, two, or three. Then write how that happens.',
  fuelInfo: 'The minimum to test tomorrow: money, a tool, people, or time. Not the big plan — the first step.',
  recordInfo:
    'A 15-second video looking at the camera, telling the idea. It lives on the back of the card. Only you and the team see it unless you want it shown.',
  doneInfo: 'The idea is already on the big screen, without your name. From here you can see the seedbed or open your card to edit.',
  economicoHint: 'money',
  ambientalHint: 'environment',
  socialHint: 'people',
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
