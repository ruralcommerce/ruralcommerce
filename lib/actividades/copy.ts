import type { ProjectSex } from '@/lib/project-sex';

export type ActividadCopy = {
  brand: string;
  loading: string;
  notFound: string;
  closedInvite: string;
  visitNoInvite: string;
  inviteLead: string;
  inviteSteps: string;
  name: string;
  phone: string;
  organization: string;
  organizationHint: string;
  companyName: string;
  email: string;
  sex: string;
  age: string;
  locality: string;
  documentId: string;
  enroll: string;
  sending: string;
  enrolledTitle: string;
  alreadyTitle: string;
  enrolledBody: string;
  confirmNow: string;
  confirmLater: string;
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
  sexOptions: Array<{ value: ProjectSex; label: string }>;
};

const es: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Cargando…',
  notFound: 'No encontramos esta actividad. Pide el enlace de nuevo al equipo.',
  closedInvite: 'Esta actividad ya está cerrada. Ya no recibe inscripciones.',
  visitNoInvite: 'Las visitas no tienen convite abierto. El equipo te envía tu enlace personal para confirmar.',
  inviteLead: 'Completa este formulario para entrar a la lista. El día del curso o capacitación, abres tu enlace personal y confirmas con «Estoy aquí».',
  inviteSteps: '1) Te inscribes aquí · 2) El día, confirmas presencia desde tu celular',
  name: 'Nombre completo',
  phone: 'Teléfono / WhatsApp',
  organization: 'Organización (si perteneces a una)',
  organizationHint: 'Cooperativa, asociación, grupo. Déjalo vacío si no aplica.',
  companyName: 'Nombre de la empresa o finca',
  email: 'Correo (opcional)',
  sex: 'Sexo / género',
  age: 'Edad',
  locality: 'Localidad o cantón',
  documentId: 'Número de documento',
  enroll: 'Inscribirme',
  sending: 'Guardando…',
  enrolledTitle: 'Ya estás en la lista de inscripción',
  alreadyTitle: 'Ya estabas en la lista',
  enrolledBody:
    'Esta inscripción ya es tu fila en la lista de presencia. El día de la actividad abre el enlace de abajo en tu celular y toca «Estoy aquí». Guarda el enlace o el mensaje de WhatsApp.',
  confirmNow: 'Confirmar presencia ahora',
  confirmLater: 'Si todavía no estás en el lugar, guarda este enlace y confírmalo el día.',
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
  sexOptions: [
    { value: 'female', label: 'Femenino' },
    { value: 'male', label: 'Masculino' },
    { value: 'collective', label: 'Colectivo / organización' },
  ],
};

const pt: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Carregando…',
  notFound: 'Não encontramos esta atividade. Peça o link de novo à equipe.',
  closedInvite: 'Esta atividade já está fechada. Não recebe mais inscrições.',
  visitNoInvite: 'Visitas não têm convite aberto. A equipe envia o seu link pessoal para confirmar.',
  inviteLead:
    'Preencha este formulário para entrar na lista. No dia do curso ou capacitação, abra o seu link pessoal e confirme com «Estou aqui».',
  inviteSteps: '1) Você se inscreve aqui · 2) No dia, confirma presença no seu celular',
  name: 'Nome completo',
  phone: 'Telefone / WhatsApp',
  organization: 'Organização (se faz parte de uma)',
  organizationHint: 'Cooperativa, associação, grupo. Deixe vazio se não se aplica.',
  companyName: 'Nome da empresa ou sítio',
  email: 'E-mail (opcional)',
  sex: 'Sexo / gênero',
  age: 'Idade',
  locality: 'Localidade ou cantão',
  documentId: 'Número do documento',
  enroll: 'Inscrever-me',
  sending: 'Salvando…',
  enrolledTitle: 'Você já está na lista de inscrição',
  alreadyTitle: 'Você já estava na lista',
  enrolledBody:
    'Esta inscrição já é a sua linha na lista de presença. No dia da atividade, abra o link abaixo no seu celular e toque em «Estou aqui». Guarde o link ou a mensagem do WhatsApp.',
  confirmNow: 'Confirmar presença agora',
  confirmLater: 'Se ainda não está no local, guarde este link e confirme no dia.',
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
  sexOptions: [
    { value: 'female', label: 'Feminino' },
    { value: 'male', label: 'Masculino' },
    { value: 'collective', label: 'Coletivo / organização' },
  ],
};

const en: ActividadCopy = {
  brand: 'Rural Commerce',
  loading: 'Loading…',
  notFound: 'We could not find this activity. Ask the team for the link again.',
  closedInvite: 'This activity is closed. It no longer accepts registration.',
  visitNoInvite: 'Field visits do not use an open invite. The team sends your personal link to confirm.',
  inviteLead:
    'Complete this form to join the list. On the day of the course or training, open your personal link and confirm with “I am here”.',
  inviteSteps: '1) You register here · 2) On the day, you confirm attendance from your phone',
  name: 'Full name',
  phone: 'Phone / WhatsApp',
  organization: 'Organization (if you belong to one)',
  organizationHint: 'Cooperative, association, group. Leave blank if not applicable.',
  companyName: 'Business or farm name',
  email: 'Email (optional)',
  sex: 'Sex / gender',
  age: 'Age',
  locality: 'Locality or canton',
  documentId: 'Document number',
  enroll: 'Register',
  sending: 'Saving…',
  enrolledTitle: 'You are on the registration list',
  alreadyTitle: 'You were already on the list',
  enrolledBody:
    'This registration is already your row on the attendance list. On the day, open the link below on your phone and tap “I am here”. Save the link or the WhatsApp message.',
  confirmNow: 'Confirm attendance now',
  confirmLater: 'If you are not at the place yet, save this link and confirm on the day.',
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
  sexOptions: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'collective', label: 'Collective / organization' },
  ],
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
