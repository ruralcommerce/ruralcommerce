export type ProjectLocaleKey = 'es' | 'pt-BR' | 'en';

export function getProjectLocaleKey(locale?: string): ProjectLocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const dateLocaleByKey: Record<ProjectLocaleKey, string> = {
  es: 'es-CR',
  'pt-BR': 'pt-BR',
  en: 'en-US',
};

export function formatProjectDate(value: string | undefined, locale?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(dateLocaleByKey[getProjectLocaleKey(locale)]);
}

export function formatProjectAnswerValue(value: unknown, locale?: string) {
  const key = getProjectLocaleKey(locale);
  const yes = key === 'es' ? 'Sí' : key === 'en' ? 'Yes' : 'Sim';
  const no = key === 'es' ? 'No' : key === 'en' ? 'No' : 'Não';

  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');
  if (typeof value === 'boolean') return value ? yes : no;
  if (value === null || typeof value === 'undefined' || value === '') return '—';
  return String(value);
}

export function getProjectStatusLabel(status: string, locale?: string) {
  const key = getProjectLocaleKey(locale);
  const labels: Record<ProjectLocaleKey, Record<string, string>> = {
    es: {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    },
    'pt-BR': {
      pending: 'Pendente',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
    },
    en: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
  };
  return labels[key][status] || status;
}

const apiMessageMap: Record<string, Record<ProjectLocaleKey, string>> = {
  'Payload inválido.': {
    es: 'Payload inválido.',
    'pt-BR': 'Payload inválido.',
    en: 'Invalid payload.',
  },
  'Status inválido.': {
    es: 'Estado inválido.',
    'pt-BR': 'Status inválido.',
    en: 'Invalid status.',
  },
  'Inscrição não encontrada.': {
    es: 'Inscripción no encontrada.',
    'pt-BR': 'Inscrição não encontrada.',
    en: 'Application not found.',
  },
  'Nome, e-mail e mensagem são obrigatórios.': {
    es: 'Nombre, correo y mensaje son obligatorios.',
    'pt-BR': 'Nome, e-mail e mensagem são obrigatórios.',
    en: 'Name, email and message are required.',
  },
  'Senha deve ter no mínimo 6 caracteres.': {
    es: 'La contraseña debe tener al menos 6 caracteres.',
    'pt-BR': 'Senha deve ter no mínimo 6 caracteres.',
    en: 'Password must be at least 6 characters.',
  },
  'E-mail inválido.': {
    es: 'Correo electrónico inválido.',
    'pt-BR': 'E-mail inválido.',
    en: 'Invalid email.',
  },
  'Senha da equipe é obrigatória.': {
    es: 'La contraseña del equipo es obligatoria.',
    'pt-BR': 'Senha da equipe é obrigatória.',
    en: 'Team password is required.',
  },
  'Senha da equipe inválida.': {
    es: 'Contraseña del equipo inválida.',
    'pt-BR': 'Senha da equipe inválida.',
    en: 'Invalid team password.',
  },
  'E-mail e senha são obrigatórios.': {
    es: 'Correo y contraseña son obligatorios.',
    'pt-BR': 'E-mail e senha são obrigatórios.',
    en: 'Email and password are required.',
  },
  'Nenhuma inscrição encontrada com este e-mail.': {
    es: 'No se encontró ninguna inscripción con este correo.',
    'pt-BR': 'Nenhuma inscrição encontrada com este e-mail.',
    en: 'No application found with this email.',
  },
  'Cadastro sem senha configurada. Refaça a inscrição.': {
    es: 'Registro sin contraseña configurada. Vuelva a inscribirse.',
    'pt-BR': 'Cadastro sem senha configurada. Refaça a inscrição.',
    en: 'Registration without a configured password. Please apply again.',
  },
  'Senha inválida.': {
    es: 'Contraseña inválida.',
    'pt-BR': 'Senha inválida.',
    en: 'Invalid password.',
  },
  'Enlace inválido o incompleto.': {
    es: 'Enlace inválido o incompleto.',
    'pt-BR': 'Link inválido ou incompleto.',
    en: 'Invalid or incomplete link.',
  },
  'Enlace inválido o expirado.': {
    es: 'Enlace inválido o expirado.',
    'pt-BR': 'Link inválido ou expirado.',
    en: 'Invalid or expired link.',
  },
  'La contraseña debe tener al menos 6 caracteres.': {
    es: 'La contraseña debe tener al menos 6 caracteres.',
    'pt-BR': 'A senha deve ter pelo menos 6 caracteres.',
    en: 'Password must be at least 6 characters.',
  },
  'Contraseña actualizada correctamente.': {
    es: 'Contraseña actualizada correctamente.',
    'pt-BR': 'Senha atualizada com sucesso.',
    en: 'Password updated successfully.',
  },
  'Dados de diagnóstico incompletos.': {
    es: 'Datos de diagnóstico incompletos.',
    'pt-BR': 'Dados de diagnóstico incompletos.',
    en: 'Incomplete diagnosis data.',
  },
  'Complete todas as respostas do diagnóstico.': {
    es: 'Completa todas las respuestas del diagnóstico.',
    'pt-BR': 'Complete todas as respostas do diagnóstico.',
    en: 'Complete all diagnosis answers.',
  },
  'Participante não encontrado.': {
    es: 'Participante no encontrado.',
    'pt-BR': 'Participante não encontrado.',
    en: 'Participant not found.',
  },
  'Diagnóstico disponível apenas para participantes aprovados.': {
    es: 'Diagnóstico disponible solo para participantes aprobados.',
    'pt-BR': 'Diagnóstico disponível apenas para participantes aprovados.',
    en: 'Diagnosis is available only for approved participants.',
  },
  'Diagnóstico enviado com sucesso.': {
    es: 'Diagnóstico enviado correctamente.',
    'pt-BR': 'Diagnóstico enviado com sucesso.',
    en: 'Diagnosis submitted successfully.',
  },
  'Nada para actualizar.': {
    es: 'Nada para actualizar.',
    'pt-BR': 'Nada para atualizar.',
    en: 'Nothing to update.',
  },
  'Etiqueta inválida.': {
    es: 'Etiqueta inválida.',
    'pt-BR': 'Etiqueta inválida.',
    en: 'Invalid tag.',
  },
};

export function mapProjectApiMessage(message: string | undefined, locale: string | undefined, fallback: string) {
  if (!message) return fallback;
  const key = getProjectLocaleKey(locale);
  return apiMessageMap[message]?.[key] || fallback;
}

export const defaultProjectHeaderNav: Record<
  ProjectLocaleKey,
  Array<{ label: string; href: string }>
> = {
  es: [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluciones', href: '/solucoes' },
    { label: 'Aliados y Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '/contacto' },
  ],
  'pt-BR': [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Aliados e Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '/contacto' },
  ],
  en: [
    { label: 'About', href: '/sobre' },
    { label: 'Solutions', href: '/solucoes' },
    { label: 'Partners & Investors', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contacto' },
  ],
};
