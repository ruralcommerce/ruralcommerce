export type ActividadCopy = {
  brand: string;
  loading: string;
  notFound: string;
  closedInvite: string;
  visitNoInvite: string;
  inviteLead: string;
  name: string;
  phone: string;
  organization: string;
  email: string;
  enroll: string;
  sending: string;
  enrolledTitle: string;
  alreadyTitle: string;
  enrolledBody: string;
  confirmNow: string;
  confirmHello: (name: string) => string;
  confirmLead: (title: string) => string;
  confirmButton: string;
  confirmedTitle: string;
  alreadyConfirmed: string;
  sinGps: string;
  lejos: string;
  geoOk: string;
  closedConfirm: string;
  place: string;
  when: string;
  project: string;
  backHint: string;
};

const es: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Cargando…',
  notFound: 'No encontramos esta actividad. Pide el enlace de nuevo al equipo.',
  closedInvite: 'Esta actividad ya está cerrada. Ya no recibe inscripciones.',
  visitNoInvite: 'Las visitas no tienen convite abierto. El equipo te envía tu enlace personal para confirmar.',
  inviteLead: 'Si todavía no estás en la lista, inscríbete. El día de la actividad confirmas la presencia desde tu celular.',
  name: 'Nombre completo',
  phone: 'Teléfono / WhatsApp',
  organization: 'Organización o finca',
  email: 'Correo (opcional)',
  enroll: 'Inscribirme',
  sending: 'Guardando…',
  enrolledTitle: 'Inscripción lista',
  alreadyTitle: 'Ya estabas en la lista',
  enrolledBody: 'Guarda esta pantalla. La presencia se confirma el día, desde este mismo celular.',
  confirmNow: 'Confirmar presencia ahora',
  confirmHello: (name) => `Hola, ${name}`,
  confirmLead: (title) => `Confirma que estás en «${title}» en este momento.`,
  confirmButton: 'Estoy aquí',
  confirmedTitle: 'Presencia registrada',
  alreadyConfirmed: 'Ya habías confirmado tu presencia.',
  sinGps: 'No se pudo leer el GPS. La presencia quedó registrada y el equipo verá que faltó la ubicación.',
  lejos: 'Presencia registrada. La ubicación quedó marcada para revisión del equipo.',
  geoOk: 'Presencia y ubicación registradas.',
  closedConfirm: 'Esta actividad ya se cerró. Si estuviste y no alcanzaste a confirmar, avisa al equipo.',
  place: 'Lugar',
  when: 'Cuándo',
  project: 'Proyecto',
  backHint: 'Puedes cerrar esta página.',
};

const pt: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Carregando…',
  notFound: 'Não encontramos esta atividade. Peça o link de novo à equipe.',
  closedInvite: 'Esta atividade já está fechada. Não recebe mais inscrições.',
  visitNoInvite: 'Visitas não têm convite aberto. A equipe envia o seu link pessoal para confirmar.',
  inviteLead: 'Se você ainda não está na lista, inscreva-se. No dia da atividade, confirme a presença neste celular.',
  name: 'Nome completo',
  phone: 'Telefone / WhatsApp',
  organization: 'Organização ou sítio',
  email: 'E-mail (opcional)',
  enroll: 'Inscrever-me',
  sending: 'Salvando…',
  enrolledTitle: 'Inscrição feita',
  alreadyTitle: 'Você já estava na lista',
  enrolledBody: 'Guarde esta tela. A presença se confirma no dia, neste mesmo celular.',
  confirmNow: 'Confirmar presença agora',
  confirmHello: (name) => `Olá, ${name}`,
  confirmLead: (title) => `Confirme que você está em «${title}» neste momento.`,
  confirmButton: 'Estou aqui',
  confirmedTitle: 'Presença registrada',
  alreadyConfirmed: 'Você já tinha confirmado a presença.',
  sinGps: 'Não foi possível ler o GPS. A presença ficou registrada e a equipe verá que faltou a localização.',
  lejos: 'Presença registrada. A localização ficou marcada para a equipe revisar.',
  geoOk: 'Presença e localização registradas.',
  closedConfirm: 'Esta atividade já foi encerrada. Se você esteve e não conseguiu confirmar, avise a equipe.',
  place: 'Lugar',
  when: 'Quando',
  project: 'Projeto',
  backHint: 'Pode fechar esta página.',
};

const en: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Loading…',
  notFound: 'We could not find this activity. Ask the team for the link again.',
  closedInvite: 'This activity is closed. It no longer accepts registration.',
  visitNoInvite: 'Field visits do not use an open invite. The team sends your personal link to confirm.',
  inviteLead: 'If you are not on the list yet, register. On the day, confirm attendance from this phone.',
  name: 'Full name',
  phone: 'Phone / WhatsApp',
  organization: 'Organization or farm',
  email: 'Email (optional)',
  enroll: 'Register',
  sending: 'Saving…',
  enrolledTitle: 'You are registered',
  alreadyTitle: 'You were already on the list',
  enrolledBody: 'Keep this screen. Attendance is confirmed on the day, from this same phone.',
  confirmNow: 'Confirm attendance now',
  confirmHello: (name) => `Hello, ${name}`,
  confirmLead: (title) => `Confirm that you are at “${title}” right now.`,
  confirmButton: 'I am here',
  confirmedTitle: 'Attendance recorded',
  alreadyConfirmed: 'You had already confirmed your attendance.',
  sinGps: 'GPS could not be read. Attendance was saved and the team will see that location is missing.',
  lejos: 'Attendance recorded. The location was flagged for the team to review.',
  geoOk: 'Attendance and location recorded.',
  closedConfirm: 'This activity is already closed. If you were there and could not confirm, tell the team.',
  place: 'Place',
  when: 'When',
  project: 'Project',
  backHint: 'You can close this page.',
};

export function actividadCopy(locale: string): ActividadCopy {
  if (locale === 'pt-BR') return pt;
  if (locale === 'en') return en;
  return es;
}

export function formatActividadWhen(iso: string, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const tag = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en' : 'es-CR';
  return date.toLocaleString(tag, { dateStyle: 'medium', timeStyle: 'short' });
}
