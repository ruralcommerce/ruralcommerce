'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatProjectAnswerValue,
  formatProjectDate,
  getProjectLocaleKey,
  getProjectStatusLabel,
  mapProjectApiMessage,
  type ProjectLocaleKey,
} from '@/lib/project-locale';
import { ProjectBroadcastPanel } from '@/components/ProjectBroadcastPanel';
import { ProjectTeamMembersPanel } from '@/components/ProjectTeamMembersPanel';
import {
  readTeamSession,
  writeTeamSession,
} from '@/lib/project-team-session-client';
import {
  PROJECT_TEAM_TAGS,
  getProjectTeamTagLabel,
  type ProjectTeamTag,
  type ProjectTeamTagFilter,
} from '@/lib/project-team-tags';

type EnrollmentRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  teamTag?: ProjectTeamTag | null;
  user: {
    email: string;
    username: string;
    accessStatus: string;
  };
  profile: {
    name: string;
    email?: string;
    phone?: string;
    organization?: string;
    city?: string;
    role?: string;
    interest?: string;
    message?: string;
    answers?: Record<string, unknown>;
    diagnosis?: {
      submittedAt?: string;
      locale?: string;
      answers?: Record<string, unknown>;
      submittedBy?: {
        type?: 'candidate' | 'team';
        teamMemberId?: string;
        teamMemberName?: string;
        teamMemberEmail?: string;
      };
    };
    locale?: string;
    marketingConsent?: boolean;
    consentAt?: string | null;
    agreement?: {
      signed?: boolean;
      signedAt?: string;
      fullName?: string;
    };
  };
};

type BulkAction = 'approve' | 'reject' | 'delete' | 'set-tag';
type AdminSection = 'hub' | 'inscriptions' | 'communications' | 'team';

const teamTagBadgeClass: Record<ProjectTeamTag, string> = {
  frutalcoop: 'bg-[#E8F0FF] text-[#1D3A7A]',
  'aliados-frutalcoop': 'bg-[#F3EAF8] text-[#6B3A8C]',
  participantes: 'bg-[#E7F6EC] text-[#1D6359]',
};

const inscriptionQuestionLabels: Record<ProjectLocaleKey, Record<string, string>> = {
  es: {
    q1: '1. Nombre del emprendimiento, finca o empresa',
    q2: '2. Nombre completo de la persona representante',
    q3: '3. Teléfono / WhatsApp de contacto',
    q4: '4. Correo electrónico',
    q5: '5. Ubicación exacta',
    q6: '6. ¿Su negocio está formalizado legalmente?',
    q7: '7. ¿Cuál es el producto o actividad principal de su negocio?',
    q8: '8. ¿Actualmente aprovecha o transforma algún residuo o subproducto de su cosecha?',
    q9: '9. ¿A quién le vende sus productos actualmente?',
    q10: '10. ¿Alguna vez ha intentado vender sus productos en conjunto con otros productores locales?',
    q11: '11. En su día a día operativo, ¿cómo lleva el control de su negocio?',
    q12: '12. ¿Qué tanto interés tiene en incorporar herramientas tecnológicas de bajo costo?',
    q13: '13. Exportar al mercado de EE. UU. bajo un modelo colaborativo. ¿Cómo ve esta meta?',
    q14: '14. Disponibilidad para el programa intensivo',
    q15: '15. ¿Por qué le gustaría ser una de las organizaciones seleccionadas?',
  },
  'pt-BR': {
    q1: '1. Nome do empreendimento, fazenda ou empresa',
    q2: '2. Nome completo da pessoa representante',
    q3: '3. Telefone / WhatsApp de contato',
    q4: '4. Endereço de e-mail',
    q5: '5. Localização exata',
    q6: '6. Seu negócio está formalizado legalmente?',
    q7: '7. Qual é o produto ou atividade principal do seu negócio?',
    q8: '8. Atualmente aproveita ou transforma algum resíduo ou subproduto da sua colheita?',
    q9: '9. Para quem você vende seus produtos atualmente?',
    q10: '10. Você já tentou vender seus produtos em conjunto com outros produtores locais?',
    q11: '11. No dia a dia operacional, como você controla seu negócio?',
    q12: '12. Qual é o seu interesse em incorporar ferramentas tecnológicas de baixo custo?',
    q13: '13. Exportar para o mercado dos EUA sob um modelo colaborativo. Como você vê essa meta?',
    q14: '14. Disponibilidade para o programa intensivo',
    q15: '15. Por que gostaria de ser uma das organizações selecionadas?',
  },
  en: {
    q1: '1. Name of the venture, farm or company',
    q2: '2. Full name of the representative',
    q3: '3. Phone / WhatsApp contact',
    q4: '4. Email address',
    q5: '5. Exact location',
    q6: '6. Is your business legally registered?',
    q7: '7. What is the main product or activity of your business?',
    q8: '8. Do you currently use or transform any waste or by-product from your harvest?',
    q9: '9. Who do you currently sell your products to?',
    q10: '10. Have you ever tried to sell your products jointly with other local producers?',
    q11: '11. How do you manage your business operations day to day?',
    q12: '12. Interest in incorporating low-cost technology tools',
    q13: '13. Exporting to the US market under a collaborative model. How do you see this goal?',
    q14: '14. Availability for the intensive program',
    q15: '15. Why would you like to be one of the selected organizations?',
  },
};

const diagnosisQuestionLabels: Record<ProjectLocaleKey, Record<string, string>> = {
  es: {
    q1: '1. ¿Cuál es el estatus legal y tributario actual del negocio?',
    q2: '2. ¿Cuenta con un plan de negocio o mapa estratégico escrito para los próximos 1-3 años?',
    q3: '3. ¿El negocio cuenta con cuentas bancarias comerciales separadas de las finanzas personales del dueño?',
    q4: '4. ¿Porcentaje de mujeres y jóvenes (menores de 35) en roles de toma de decisión en el negocio?',
    q5: '5. ¿Cómo registra los ingresos, gastos y cuentas por cobrar/pagar?',
    q6: '6. ¿Conoce exactamente el costo unitario de producción (materiales, mano de obra, indirectos)?',
    q7: '7. ¿Cómo define el precio de venta de sus productos?',
    q8: '8. ¿Realiza una proyección o seguimiento de su flujo de caja mensual para evitar quedarse sin efectivo?',
    q9: '9. ¿Cuál es su capacidad demostrable actual para acceder a un crédito bancario para capital de trabajo?',
    q10: '10. ¿Los procesos productivos están documentados para que los siga cualquier empleado?',
    q11: '11. ¿Qué porcentaje de biomasa o materia prima se desperdicia en el procesamiento?',
    q12: '12. ¿Qué porcentaje del producto final sale defectuoso o es rechazado por el cliente?',
    q13: '13. ¿Cómo controla la cantidad de materia prima y producto terminado almacenado?',
    q14: '14. ¿Qué hace actualmente con los subproductos o residuos?',
    q15: '15. ¿Lleva algún registro o realiza acciones para optimizar consumo de agua y electricidad?',
    q16: '16. ¿Nivel de habilidad del equipo para usar herramientas digitales en el trabajo?',
    q17: '17. ¿Dispone de conexión a Internet estable en áreas de producción/finca?',
    q18: '18. ¿Puede rastrear un lote ante reclamos de cliente?',
    q19: '19. ¿Cómo mide variables ambientales críticas (humedad, temperatura)?',
    q20: '20. ¿Con qué frecuencia usa datos para tomar decisiones de negocio?',
    q21: '21. ¿Cuál es su nivel de dependencia de intermediarios para vender su producto?',
    q22: '22. ¿El producto cumple con requisitos de anaquel?',
    q23: '23. ¿Conoce y cumple normas internacionales de inocuidad como FDA/FSMA?',
    q24: '24. ¿Nivel de colaboración con otros productores para consolidar volumen y negociar precios?',
    q25: '25. ¿Tiene marca registrada, catálogo digital o presencia comercial en internet?',
    q26: '26. ¿Tiene mecanismo formal para medir satisfacción y recibir retroalimentación de compradores?',
  },
  'pt-BR': {
    q1: '1. Qual é o status legal e tributário atual do negócio?',
    q2: '2. Existe plano de negócio ou mapa estratégico escrito para os próximos 1-3 anos?',
    q3: '3. O negócio possui contas bancárias comerciais separadas das finanças pessoais?',
    q4: '4. Percentual de mulheres e jovens (menores de 35) em papéis de decisão?',
    q5: '5. Como registra receitas, despesas e contas a receber/pagar?',
    q6: '6. Conhece exatamente o custo unitário de produção?',
    q7: '7. Como define o preço de venda dos produtos?',
    q8: '8. Faz projeção ou acompanhamento mensal de fluxo de caixa?',
    q9: '9. Qual a capacidade atual de acesso a crédito bancário para capital de giro?',
    q10: '10. Processos produtivos estão documentados para qualquer colaborador seguir?',
    q11: '11. Qual percentual de biomassa/matéria-prima se perde no processamento?',
    q12: '12. Qual percentual do produto final sai com defeito ou rejeição do cliente?',
    q13: '13. Como controla estoque de matéria-prima e produto final?',
    q14: '14. O que faz com subprodutos ou resíduos atualmente?',
    q15: '15. Registra ou executa ações para eficiência de água e energia?',
    q16: '16. Nível de competência digital da equipe no trabalho?',
    q17: '17. Existe conexão de internet estável nas áreas de produção/fazenda?',
    q18: '18. Consegue rastrear lote em caso de reclamação de cliente?',
    q19: '19. Como mede variáveis ambientais críticas (umidade, temperatura)?',
    q20: '20. Com que frequência usa dados para decisões do negócio?',
    q21: '21. Qual o nível de dependência de intermediários para vender?',
    q22: '22. O produto atende requisitos de gôndola/apresentação?',
    q23: '23. Conhece e cumpre normas internacionais de inocuidade (FDA/FSMA)?',
    q24: '24. Nível de colaboração em vendas conjuntas com outros produtores?',
    q25: '25. Possui marca, catálogo digital ou presença comercial na internet?',
    q26: '26. Possui mecanismo formal para medir satisfação e feedback de clientes?',
  },
  en: {
    q1: '1. Current legal and tax status of the business',
    q2: '2. Is there a written business plan/strategic roadmap for the next 1-3 years?',
    q3: '3. Does the business have separate commercial bank accounts?',
    q4: '4. Percentage of women and youth (<35) in decision-making roles',
    q5: '5. How are income, expenses and receivables/payables recorded?',
    q6: '6. Is exact unit production cost known?',
    q7: '7. How is selling price defined?',
    q8: '8. Is there monthly cash flow projection/tracking?',
    q9: '9. Current proven ability to access bank credit for working capital',
    q10: '10. Are production processes documented for any employee to follow?',
    q11: '11. What percentage of biomass/raw material is wasted in processing?',
    q12: '12. What percentage of final product is defective/rejected by clients?',
    q13: '13. How is raw and finished inventory controlled?',
    q14: '14. What is currently done with by-products or waste?',
    q15: '15. Are there records/actions for water and electricity efficiency?',
    q16: '16. Team digital skills level for workplace tools',
    q17: '17. Is internet connectivity stable in production/farm areas?',
    q18: '18. Can a batch be traced when a client complaint occurs?',
    q19: '19. How are critical environmental variables measured?',
    q20: '20. How often are recorded data used for business decisions?',
    q21: '21. Dependence level on intermediaries to sell product',
    q22: '22. Product compliance with shelf/packaging requirements',
    q23: '23. Knowledge/compliance with FDA/FSMA-like food safety rules',
    q24: '24. Current collaboration level for joint sales with other producers',
    q25: '25. Registered brand, digital catalog or online commercial presence',
    q26: '26. Formal mechanism to measure customer satisfaction and feedback',
  },
};

const uiCopy = {
  es: {
    loginEyebrow: 'Intranet del equipo',
    loginTitle: 'Acceso al panel de inscripciones',
    teamPassword: 'Contraseña del equipo',
    teamEmail: 'Correo del equipo',
    loginCta: 'Entrar a la intranet',
    assistDiagnosis: 'Asistencia técnica',
    hubEyebrow: 'Panel del equipo',
    hubTitle: '¿Qué quieres administrar?',
    hubHint: 'Elige una sección. Cada área tiene una función específica para no mezclar todo en la misma pantalla.',
    sectionInscriptionsTitle: 'Inscripciones',
    sectionInscriptionsText: 'Revisar, aprobar, rechazar o eliminar participantes. Ver convenio y diagnóstico.',
    sectionCommsTitle: 'Comunicaciones',
    sectionCommsText: 'Enviar e-mails, ver ejemplo del mensaje, reenviar invitación al convenio.',
    sectionTeamTitle: 'Usuarios del equipo',
    sectionTeamText: 'Invitar técnicos por correo para que creen su nombre y contraseña.',
    backToHub: 'Volver al inicio',
    panelEyebrow: 'Inscripciones',
    panelTitle: 'Inscripciones del proyecto',
    filterAll: 'Todas',
    filterPending: 'Pendientes',
    filterApproved: 'Aprobadas',
    filterRejected: 'Rechazadas',
    filterStatusLabel: 'Estado',
    filterConvenioLabel: 'Convenio',
    filterConvenioAll: 'Todos los convenios',
    filterConvenioSigned: 'Convenio firmado',
    filterConvenioPending: 'Convenio pendiente',
    filterDiagnosisLabel: 'Diagnóstico',
    filterDiagnosisAll: 'Todos los diagnósticos',
    filterDiagnosisDone: 'Diagnóstico enviado',
    filterDiagnosisPending: 'Diagnóstico pendiente',
    filterTagLabel: 'Etiqueta',
    filterTagAll: 'Todas las etiquetas',
    filterTagNone: 'Sin etiqueta',
    tagLabel: 'Etiqueta del equipo',
    tagNone: 'Sin etiqueta',
    tagApplySelected: 'Aplicar etiqueta',
    diagnosisDoneBadge: 'Diagnóstico enviado',
    diagnosisPendingBadge: 'Diagnóstico pendiente',
    loading: 'Cargando inscripciones...',
    selectAll: 'Seleccionar todas',
    selectedCount: '{count} seleccionadas',
    approveSelected: 'Aprobar seleccionadas',
    rejectSelected: 'Rechazar seleccionadas',
    deleteSelected: 'Eliminar seleccionadas',
    deleteOne: 'Eliminar',
    convenioSignedBadge: 'Convenio firmado',
    convenioPendingBadge: 'Convenio pendiente',
    consentBadge: 'Acepta comunicaciones',
    viewForm: 'Ver formulario',
    viewDiagnosis: 'Ver diagnóstico',
    approve: 'Aprobar',
    reject: 'Rechazar',
    profileSection: 'Perfil',
    contactSection: 'Contacto',
    noOrganization: 'Sin organización',
    noCity: 'Sin ciudad',
    noRole: 'Sin función informada',
    noInterest: 'Sin interés informado',
    noPhone: 'Sin teléfono',
    localeUnknown: 'Idioma no informado',
    noMessage: 'Sin mensaje adicional.',
    fullForm: 'Formulario completo',
    fullDiagnosis: 'Diagnóstico completo',
    close: 'Cerrar',
    participantFallback: 'Participante',
    csvHeader: 'Pregunta,Respuesta',
    confirmDelete: '¿Eliminar {count} inscripción(es)? Esta acción no se puede deshacer.',
    errorAuth: 'No fue posible autenticar al equipo.',
    errorAuthGeneric: 'Error al autenticar al equipo.',
    errorLoad: 'No fue posible cargar las inscripciones.',
    errorLoadGeneric: 'Error al cargar las inscripciones.',
    errorUpdate: 'No fue posible actualizar la inscripción.',
    errorUpdateGeneric: 'Error al actualizar la inscripción.',
    errorBulk: 'No fue posible completar la acción en lote.',
    errorBulkGeneric: 'Error al procesar la acción en lote.',
  },
  'pt-BR': {
    loginEyebrow: 'Intranet da equipe',
    loginTitle: 'Acesso ao painel de inscrições',
    teamPassword: 'Senha da equipe',
    teamEmail: 'E-mail da equipe',
    loginCta: 'Entrar na intranet',
    assistDiagnosis: 'Assistência técnica',
    hubEyebrow: 'Painel da equipe',
    hubTitle: 'O que você quer administrar?',
    hubHint: 'Escolha uma seção. Cada área tem uma função específica para não misturar tudo na mesma tela.',
    sectionInscriptionsTitle: 'Inscrições',
    sectionInscriptionsText: 'Revisar, aprovar, rejeitar ou apagar participantes. Ver convênio e diagnóstico.',
    sectionCommsTitle: 'Comunicações',
    sectionCommsText: 'Enviar e-mails, ver exemplo da mensagem, reenviar convite do convênio.',
    sectionTeamTitle: 'Usuários da equipe',
    sectionTeamText: 'Convidar técnicos por e-mail para que criem o nome e a senha.',
    backToHub: 'Voltar ao início',
    panelEyebrow: 'Inscrições',
    panelTitle: 'Inscrições do projeto',
    filterAll: 'Todas',
    filterPending: 'Pendentes',
    filterApproved: 'Aprovadas',
    filterRejected: 'Rejeitadas',
    filterStatusLabel: 'Status',
    filterConvenioLabel: 'Convênio',
    filterConvenioAll: 'Todos os convênios',
    filterConvenioSigned: 'Convênio assinado',
    filterConvenioPending: 'Convênio pendente',
    filterDiagnosisLabel: 'Diagnóstico',
    filterDiagnosisAll: 'Todos os diagnósticos',
    filterDiagnosisDone: 'Diagnóstico enviado',
    filterDiagnosisPending: 'Diagnóstico pendente',
    filterTagLabel: 'Etiqueta',
    filterTagAll: 'Todas as etiquetas',
    filterTagNone: 'Sem etiqueta',
    tagLabel: 'Etiqueta da equipe',
    tagNone: 'Sem etiqueta',
    tagApplySelected: 'Aplicar etiqueta',
    diagnosisDoneBadge: 'Diagnóstico enviado',
    diagnosisPendingBadge: 'Diagnóstico pendente',
    loading: 'Carregando inscrições...',
    selectAll: 'Selecionar todas',
    selectedCount: '{count} selecionadas',
    approveSelected: 'Aprovar selecionadas',
    rejectSelected: 'Rejeitar selecionadas',
    deleteSelected: 'Apagar selecionadas',
    deleteOne: 'Apagar',
    convenioSignedBadge: 'Convênio assinado',
    convenioPendingBadge: 'Convênio pendente',
    consentBadge: 'Aceita comunicações',
    viewForm: 'Ver formulário',
    viewDiagnosis: 'Ver diagnóstico',
    approve: 'Aprovar',
    reject: 'Rejeitar',
    profileSection: 'Perfil',
    contactSection: 'Contato',
    noOrganization: 'Sem organização',
    noCity: 'Sem cidade',
    noRole: 'Sem função informada',
    noInterest: 'Sem interesse informado',
    noPhone: 'Sem telefone',
    localeUnknown: 'Locale não informado',
    noMessage: 'Sem mensagem adicional.',
    fullForm: 'Formulário completo',
    fullDiagnosis: 'Diagnóstico completo',
    close: 'Fechar',
    participantFallback: 'Participante',
    csvHeader: 'Pergunta,Resposta',
    confirmDelete: 'Apagar {count} inscrição(ões)? Esta ação não pode ser desfeita.',
    errorAuth: 'Não foi possível autenticar a equipe.',
    errorAuthGeneric: 'Erro ao autenticar equipe.',
    errorLoad: 'Não foi possível carregar as inscrições.',
    errorLoadGeneric: 'Erro ao carregar as inscrições.',
    errorUpdate: 'Não foi possível atualizar a inscrição.',
    errorUpdateGeneric: 'Erro ao atualizar a inscrição.',
    errorBulk: 'Não foi possível concluir a ação em lote.',
    errorBulkGeneric: 'Erro ao processar a ação em lote.',
  },
  en: {
    loginEyebrow: 'Team intranet',
    loginTitle: 'Access to the applications panel',
    teamPassword: 'Team password',
    teamEmail: 'Team email',
    loginCta: 'Enter intranet',
    assistDiagnosis: 'Technical assistance',
    hubEyebrow: 'Team panel',
    hubTitle: 'What do you want to manage?',
    hubHint: 'Choose a section. Each area has a specific job so everything is not mixed on one screen.',
    sectionInscriptionsTitle: 'Applications',
    sectionInscriptionsText: 'Review, approve, reject or delete participants. View agreement and diagnosis.',
    sectionCommsTitle: 'Communications',
    sectionCommsText: 'Send emails, preview the message, resend the agreement invitation.',
    sectionTeamTitle: 'Team users',
    sectionTeamText: 'Invite technicians by email so they can set their name and password.',
    backToHub: 'Back to home',
    panelEyebrow: 'Applications',
    panelTitle: 'Project applications',
    filterAll: 'All',
    filterPending: 'Pending',
    filterApproved: 'Approved',
    filterRejected: 'Rejected',
    filterStatusLabel: 'Status',
    filterConvenioLabel: 'Agreement',
    filterConvenioAll: 'All agreements',
    filterConvenioSigned: 'Agreement signed',
    filterConvenioPending: 'Agreement pending',
    filterDiagnosisLabel: 'Diagnosis',
    filterDiagnosisAll: 'All diagnoses',
    filterDiagnosisDone: 'Diagnosis submitted',
    filterDiagnosisPending: 'Diagnosis pending',
    filterTagLabel: 'Tag',
    filterTagAll: 'All tags',
    filterTagNone: 'No tag',
    tagLabel: 'Team tag',
    tagNone: 'No tag',
    tagApplySelected: 'Apply tag',
    diagnosisDoneBadge: 'Diagnosis submitted',
    diagnosisPendingBadge: 'Diagnosis pending',
    loading: 'Loading applications...',
    selectAll: 'Select all',
    selectedCount: '{count} selected',
    approveSelected: 'Approve selected',
    rejectSelected: 'Reject selected',
    deleteSelected: 'Delete selected',
    deleteOne: 'Delete',
    convenioSignedBadge: 'Agreement signed',
    convenioPendingBadge: 'Agreement pending',
    consentBadge: 'Accepts communications',
    viewForm: 'View form',
    viewDiagnosis: 'View diagnosis',
    approve: 'Approve',
    reject: 'Reject',
    profileSection: 'Profile',
    contactSection: 'Contact',
    noOrganization: 'No organization',
    noCity: 'No city',
    noRole: 'No role provided',
    noInterest: 'No interest provided',
    noPhone: 'No phone',
    localeUnknown: 'Locale not provided',
    noMessage: 'No additional message.',
    fullForm: 'Full form',
    fullDiagnosis: 'Full diagnosis',
    close: 'Close',
    participantFallback: 'Participant',
    csvHeader: 'Question,Answer',
    confirmDelete: 'Delete {count} application(s)? This action cannot be undone.',
    errorAuth: 'Could not authenticate the team.',
    errorAuthGeneric: 'Error authenticating the team.',
    errorLoad: 'Could not load applications.',
    errorLoadGeneric: 'Error loading applications.',
    errorUpdate: 'Could not update the application.',
    errorUpdateGeneric: 'Error updating the application.',
    errorBulk: 'Could not complete the bulk action.',
    errorBulkGeneric: 'Error processing the bulk action.',
  },
} as const;

function getOrderedAnswerEntries(answers?: Record<string, unknown>) {
  if (!answers) return [] as Array<[string, unknown]>;
  return Object.entries(answers).sort(([a], [b]) => {
    const an = Number((a.match(/\d+/) || ['0'])[0]);
    const bn = Number((b.match(/\d+/) || ['0'])[0]);
    if (an === bn) return a.localeCompare(b);
    return an - bn;
  });
}

function getInscriptionAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = inscriptionQuestionLabels[getProjectLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

function getDiagnosisAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = diagnosisQuestionLabels[getProjectLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

function triggerDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ProjectAdminDashboard({ locale }: { locale: string }) {
  const localeKey = getProjectLocaleKey(locale);
  const t = uiCopy[localeKey];

  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [convenioFilter, setConvenioFilter] = useState<'all' | 'signed' | 'pending'>('all');
  const [diagnosisFilter, setDiagnosisFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [tagFilter, setTagFilter] = useState<ProjectTeamTagFilter>('all');
  const [bulkTag, setBulkTag] = useState<'' | ProjectTeamTag | 'none'>('');
  const [section, setSection] = useState<AdminSection>('hub');
  const [teamPassword, setTeamPassword] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamToken, setTeamToken] = useState('');
  const [teamMemberName, setTeamMemberName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(null);
  const [selectedDiagnosisRecord, setSelectedDiagnosisRecord] = useState<EnrollmentRecord | null>(null);

  const getDiagnosisRows = (record: EnrollmentRecord) =>
    getOrderedAnswerEntries(record.profile.diagnosis?.answers).map(([key, value]) => [
      getDiagnosisAnswerLabel(key, record.profile.diagnosis?.locale || record.profile.locale),
      formatProjectAnswerValue(value, localeKey),
    ]) as Array<[string, string]>;

  const toCsv = (rows: Array<[string, string]>) => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [t.csvHeader, ...rows.map(([question, answer]) => `${escape(question)},${escape(answer)}`)].join('\n');
  };

  const downloadDiagnosisCsv = (record: EnrollmentRecord) => {
    triggerDownload(toCsv(getDiagnosisRows(record)), `diagnostico-${record.id}.csv`, 'text/csv;charset=utf-8;');
  };

  const downloadDiagnosisWord = (record: EnrollmentRecord) => {
    const rows = getDiagnosisRows(record)
      .map(([question, answer]) => `<tr><td style="border:1px solid #ccc;padding:6px;"><strong>${question}</strong></td><td style="border:1px solid #ccc;padding:6px;">${answer}</td></tr>`)
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><h2>${t.fullDiagnosis} - ${record.profile.name}</h2><table style="border-collapse:collapse;width:100%;">${rows}</table></body></html>`;
    triggerDownload(html, `diagnostico-${record.id}.doc`, 'application/msword');
  };

  const downloadDiagnosisExcel = (record: EnrollmentRecord) => {
    const rows = getDiagnosisRows(record)
      .map(([question, answer]) => `<tr><td style="border:1px solid #ccc;padding:6px;"><strong>${question}</strong></td><td style="border:1px solid #ccc;padding:6px;">${answer}</td></tr>`)
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${rows}</table></body></html>`;
    triggerDownload(html, `diagnostico-${record.id}.xls`, 'application/vnd.ms-excel');
  };

  const downloadDiagnosisPdf = (record: EnrollmentRecord) => {
    const rows = getDiagnosisRows(record);
    const tableRows = rows
      .map(
        ([question, answer]) =>
          `<tr><td style="border:1px solid #d9e3ec;padding:6px;vertical-align:top;"><strong>${question}</strong></td><td style="border:1px solid #d9e3ec;padding:6px;">${answer}</td></tr>`
      )
      .join('');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>diagnostico-${record.id}</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
    <h2 style="margin: 0 0 4px;">${t.fullDiagnosis} - ${record.profile.name || t.participantFallback}</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">${record.user.email || ''}</p>
    <table style="width:100%; border-collapse:collapse; font-size:12px;">${tableRows}</table>
  </body>
</html>`;

    const popup = window.open('', '_blank', 'width=1024,height=768');
    if (!popup) return;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  async function authenticateTeam() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/auth/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teamEmail, password: teamPassword }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorAuth));
        setAuthenticated(false);
        return;
      }
      setRecords(payload.records || []);
      setTeamToken(payload.token || '');
      setTeamMemberName(payload.member?.name || '');
      setTeamRole(payload.member?.role || '');
      if (payload.token && payload.member) {
        writeTeamSession({
          token: payload.token,
          memberId: payload.member.id,
          name: payload.member.name,
          email: payload.member.email,
          role: payload.member.role,
        });
      }
      setAuthenticated(true);
      setSelectedIds(new Set());
    } catch {
      setError(t.errorAuthGeneric);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = readTeamSession();
    if (!session?.token) return;
    setTeamToken(session.token);
    setTeamEmail(session.email);
    setTeamMemberName(session.name);
    setTeamRole(session.role);
    setAuthenticated(true);
  }, []);

  const loadRecords = async () => {
    if (!authenticated) return;
    setLoading(true);
    setError('');
    try {
      const headers: Record<string, string> = {};
      if (teamToken) headers.Authorization = `Bearer ${teamToken}`;
      const response = await fetch('/api/projeto/inscriptions', { headers });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorLoad));
        return;
      }
      setRecords(payload.records || []);
      setSelectedIds(new Set());
    } catch {
      setError(t.errorLoadGeneric);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && teamToken) {
      loadRecords();
    }
  }, [authenticated, teamToken]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filter !== 'all' && record.status !== filter) return false;

      const convenioSigned = record.profile.agreement?.signed === true;
      if (convenioFilter === 'signed' && !convenioSigned) return false;
      if (convenioFilter === 'pending' && convenioSigned) return false;

      const diagnosisDone = Boolean(record.profile.diagnosis?.answers);
      if (diagnosisFilter === 'done' && !diagnosisDone) return false;
      if (diagnosisFilter === 'pending' && diagnosisDone) return false;

      const tag = record.teamTag || null;
      if (tagFilter === 'none' && tag) return false;
      if (tagFilter !== 'all' && tagFilter !== 'none' && tag !== tagFilter) return false;

      return true;
    });
  }, [convenioFilter, diagnosisFilter, filter, records, tagFilter]);

  const allFilteredSelected =
    filteredRecords.length > 0 && filteredRecords.every((record) => selectedIds.has(record.id));
  const selectedCount = selectedIds.size;

  function toggleRecordSelection(recordId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredRecords.forEach((record) => next.delete(record.id));
      } else {
        filteredRecords.forEach((record) => next.add(record.id));
      }
      return next;
    });
  }

  async function updateStatus(recordId: string, status: EnrollmentRecord['status']) {
    try {
      const response = await fetch(`/api/projeto/inscriptions/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: '' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorUpdate));
        return;
      }
      await loadRecords();
    } catch {
      setError(t.errorUpdateGeneric);
    }
  }

  async function updateTeamTag(recordId: string, teamTag: ProjectTeamTag | null) {
    try {
      const response = await fetch(`/api/projeto/inscriptions/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamTag }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorUpdate));
        return;
      }
      setRecords((current) =>
        current.map((record) => (record.id === recordId ? { ...record, teamTag } : record))
      );
    } catch {
      setError(t.errorUpdateGeneric);
    }
  }

  async function applyBulkTag() {
    if (!bulkTag || selectedIds.size === 0) return;
    setBulkLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/inscriptions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: 'set-tag',
          teamTag: bulkTag === 'none' ? null : bulkTag,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorBulk));
        return;
      }
      setBulkTag('');
      await loadRecords();
    } catch {
      setError(t.errorBulkGeneric);
    } finally {
      setBulkLoading(false);
    }
  }

  async function deleteRecord(recordId: string) {
    if (!window.confirm(t.confirmDelete.replace('{count}', '1'))) return;

    try {
      const response = await fetch(`/api/projeto/inscriptions/${recordId}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorBulk));
        return;
      }
      await loadRecords();
    } catch {
      setError(t.errorBulkGeneric);
    }
  }

  async function runBulkAction(action: BulkAction) {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    if (action === 'delete' && !window.confirm(t.confirmDelete.replace('{count}', String(ids.length)))) {
      return;
    }

    setBulkLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/inscriptions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorBulk));
        return;
      }
      await loadRecords();
    } catch {
      setError(t.errorBulkGeneric);
    } finally {
      setBulkLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">{t.loginEyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">{t.loginTitle}</h1>
        </div>
        <div className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-[#071F5E]">{t.teamEmail}</label>
          <input
            type="email"
            value={teamEmail}
            onChange={(e) => setTeamEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3"
          />
          <label className="mt-4 block text-sm font-medium text-[#071F5E]">{t.teamPassword}</label>
          <input
            type="password"
            value={teamPassword}
            onChange={(e) => setTeamPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3"
          />
          <button
            onClick={authenticateTeam}
            className="mt-4 rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E]"
          >
            {t.loginCta}
          </button>
        </div>
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {section === 'hub' ? (
        <div className="space-y-6">
          {teamMemberName ? (
            <p className="text-sm text-[#2F3336]/75">
              Logado como <strong>{teamMemberName}</strong>
            </p>
          ) : null}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">{t.hubEyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">{t.hubTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#2F3336]/75">{t.hubHint}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSection('inscriptions')}
              className="rounded-3xl border border-[#E6EBF1] bg-white p-6 text-left shadow-sm transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">01</p>
              <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.sectionInscriptionsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.sectionInscriptionsText}</p>
            </button>
            <button
              type="button"
              onClick={() => setSection('communications')}
              className="rounded-3xl border border-[#E6EBF1] bg-white p-6 text-left shadow-sm transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">02</p>
              <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.sectionCommsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.sectionCommsText}</p>
            </button>
            {teamRole === 'master' ? (
              <button
                type="button"
                onClick={() => setSection('team')}
                className="rounded-3xl border border-[#E6EBF1] bg-white p-6 text-left shadow-sm transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">03</p>
                <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.sectionTeamTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.sectionTeamText}</p>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {section === 'team' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSection('hub')}
            className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
          >
            ← {t.backToHub}
          </button>
          <ProjectTeamMembersPanel locale={locale} teamToken={teamToken} />
        </div>
      ) : null}

      {section === 'communications' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSection('hub')}
            className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
          >
            ← {t.backToHub}
          </button>
          <ProjectBroadcastPanel locale={locale} teamPassword={teamPassword} teamToken={teamToken} />
        </div>
      ) : null}

      {section === 'inscriptions' ? (
      <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => setSection('hub')}
            className="mb-3 rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
          >
            ← {t.backToHub}
          </button>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">{t.panelEyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">{t.panelTitle}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F3336]/55">
            {t.filterStatusLabel}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="min-w-[10rem] rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm font-medium normal-case tracking-normal text-[#071F5E]"
            >
              <option value="all">{t.filterAll}</option>
              <option value="pending">{t.filterPending}</option>
              <option value="approved">{t.filterApproved}</option>
              <option value="rejected">{t.filterRejected}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F3336]/55">
            {t.filterConvenioLabel}
            <select
              value={convenioFilter}
              onChange={(e) => setConvenioFilter(e.target.value as 'all' | 'signed' | 'pending')}
              className="min-w-[11rem] rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm font-medium normal-case tracking-normal text-[#071F5E]"
            >
              <option value="all">{t.filterConvenioAll}</option>
              <option value="signed">{t.filterConvenioSigned}</option>
              <option value="pending">{t.filterConvenioPending}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F3336]/55">
            {t.filterDiagnosisLabel}
            <select
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value as 'all' | 'done' | 'pending')}
              className="min-w-[12rem] rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm font-medium normal-case tracking-normal text-[#071F5E]"
            >
              <option value="all">{t.filterDiagnosisAll}</option>
              <option value="done">{t.filterDiagnosisDone}</option>
              <option value="pending">{t.filterDiagnosisPending}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F3336]/55">
            {t.filterTagLabel}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value as ProjectTeamTagFilter)}
              className="min-w-[12rem] rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm font-medium normal-case tracking-normal text-[#071F5E]"
            >
              <option value="all">{t.filterTagAll}</option>
              <option value="none">{t.filterTagNone}</option>
              {PROJECT_TEAM_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {getProjectTeamTagLabel(tag)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E6EBF1] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-[#071F5E]">
          <input
            type="checkbox"
            checked={allFilteredSelected && filteredRecords.length > 0}
            onChange={toggleSelectAllFiltered}
            className="h-4 w-4 rounded border-[#D9E3EC] text-[#52ADAD]"
          />
          {t.selectAll}
        </label>

        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#2F3336]/75">
              {t.selectedCount.replace('{count}', String(selectedCount))}
            </span>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => runBulkAction('approve')}
              className="rounded-full bg-[#52ADAD] px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
            >
              {t.approveSelected}
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => runBulkAction('reject')}
              className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
            >
              {t.rejectSelected}
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => runBulkAction('delete')}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
            >
              {t.deleteSelected}
            </button>
            <select
              value={bulkTag}
              onChange={(e) => setBulkTag(e.target.value as '' | ProjectTeamTag | 'none')}
              className="rounded-full border border-[#D9E3EC] px-3 py-2 text-sm text-[#071F5E]"
            >
              <option value="">{t.tagLabel}</option>
              <option value="none">{t.tagNone}</option>
              {PROJECT_TEAM_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {getProjectTeamTagLabel(tag)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={bulkLoading || !bulkTag}
              onClick={applyBulkTag}
              className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
            >
              {t.tagApplySelected}
            </button>
          </div>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-[#2F3336]/70">{t.loading}</p>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <article
              key={record.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm ${
                selectedIds.has(record.id) ? 'border-[#52ADAD] ring-1 ring-[#52ADAD]/30' : 'border-[#E6EBF1]'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(record.id)}
                    onChange={() => toggleRecordSelection(record.id)}
                    className="mt-1.5 h-4 w-4 rounded border-[#D9E3EC] text-[#52ADAD]"
                    aria-label={record.profile.name}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-[#071F5E]">{record.profile.name}</h2>
                      <span className="rounded-full bg-[#EEF7F7] px-3 py-1 text-xs font-semibold text-[#1D6359]">
                        {getProjectStatusLabel(record.status, localeKey)}
                      </span>
                      {record.teamTag ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${teamTagBadgeClass[record.teamTag]}`}>
                          {getProjectTeamTagLabel(record.teamTag)}
                        </span>
                      ) : null}
                      {record.status === 'approved' ? (
                        <>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              record.profile.agreement?.signed
                                ? 'bg-[#E7F6EC] text-[#1D6359]'
                                : 'bg-[#FDF3E7] text-[#9A6A1B]'
                            }`}
                          >
                            {record.profile.agreement?.signed ? t.convenioSignedBadge : t.convenioPendingBadge}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              record.profile.diagnosis?.answers
                                ? 'bg-[#E7F6EC] text-[#1D6359]'
                                : 'bg-[#FDF3E7] text-[#9A6A1B]'
                            }`}
                          >
                            {record.profile.diagnosis?.answers ? t.diagnosisDoneBadge : t.diagnosisPendingBadge}
                          </span>
                        </>
                      ) : null}
                      {record.profile.marketingConsent ? (
                        <span className="rounded-full bg-[#EEF1F7] px-3 py-1 text-xs font-semibold text-[#3A4B7A]">
                          {t.consentBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[#2F3336]/75">{record.user.email}</p>
                    <p className="mt-1 text-sm text-[#2F3336]/75">
                      {record.profile.organization || t.noOrganization} · {record.profile.city || t.noCity}
                    </p>
                    <p className="mt-1 text-xs text-[#2F3336]/55">{formatProjectDate(record.createdAt, localeKey)}</p>
                    <label className="mt-3 flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F3336]/55">
                      {t.tagLabel}
                      <select
                        value={record.teamTag || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          void updateTeamTag(record.id, value ? (value as ProjectTeamTag) : null);
                        }}
                        className="min-w-[12rem] rounded-2xl border border-[#D9E3EC] px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#071F5E]"
                      >
                        <option value="">{t.tagNone}</option>
                        {PROJECT_TEAM_TAGS.map((tag) => (
                          <option key={tag} value={tag}>
                            {getProjectTeamTagLabel(tag)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    {t.viewForm}
                  </button>
                  <button
                    onClick={() => setSelectedDiagnosisRecord(record)}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-40"
                    disabled={!record.profile.diagnosis?.answers}
                  >
                    {t.viewDiagnosis}
                  </button>
                  {record.status === 'approved' ? (
                    <a
                      href={`/${localeKey}/admin/assist/${record.id}`}
                      className="rounded-full border border-[#52ADAD] bg-[#F3FAFA] px-4 py-2 text-sm font-semibold text-[#1D6359]"
                    >
                      {t.assistDiagnosis}
                    </a>
                  ) : null}
                  <button
                    onClick={() => updateStatus(record.id, 'approved')}
                    className="rounded-full bg-[#52ADAD] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    {t.approve}
                  </button>
                  <button
                    onClick={() => updateStatus(record.id, 'rejected')}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    {t.reject}
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                  >
                    {t.deleteOne}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.profileSection}</p>
                  <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.role || t.noRole}</p>
                  <p className="text-sm text-[#2F3336]/80">{record.profile.interest || t.noInterest}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.contactSection}</p>
                  <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.phone || t.noPhone}</p>
                  <p className="text-sm text-[#2F3336]/80">{record.profile.locale || t.localeUnknown}</p>
                </div>
              </div>
              <p className="mt-4 rounded-2xl bg-[#F7FAFB] p-4 text-sm text-[#2F3336]/80">
                {record.profile.message || t.noMessage}
              </p>
            </article>
          ))}
        </div>
      )}
      </div>
      ) : null}

      {selectedRecord ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071F5E]/45 p-4" onClick={() => setSelectedRecord(null)}>
          <div
            className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.fullForm}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#071F5E]">{selectedRecord.profile.name}</h3>
                <p className="mt-1 text-sm text-[#2F3336]/75">{selectedRecord.user.email}</p>
                {selectedRecord.profile.agreement?.signed ? (
                  <p className="mt-1 text-sm text-[#1D6359]">
                    {t.convenioSignedBadge}
                    {selectedRecord.profile.agreement.fullName
                      ? ` · ${selectedRecord.profile.agreement.fullName}`
                      : ''}
                    {selectedRecord.profile.agreement.signedAt
                      ? ` · ${formatProjectDate(selectedRecord.profile.agreement.signedAt, localeKey)}`
                      : ''}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F7FAFB] p-4">
              <div className="grid gap-2">
                {getOrderedAnswerEntries(selectedRecord.profile.answers).map(([key, value]) => (
                  <div key={key} className="text-sm text-[#2F3336]/85">
                    <span className="font-semibold text-[#071F5E]">{getInscriptionAnswerLabel(key, selectedRecord.profile.locale)}:</span>{' '}
                    {formatProjectAnswerValue(value, selectedRecord.profile.locale || localeKey)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedDiagnosisRecord ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071F5E]/45 p-4" onClick={() => setSelectedDiagnosisRecord(null)}>
          <div
            className="max-h-[85vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.fullDiagnosis}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#071F5E]">{selectedDiagnosisRecord.profile.name}</h3>
                <p className="mt-1 text-sm text-[#2F3336]/75">{selectedDiagnosisRecord.user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadDiagnosisPdf(selectedDiagnosisRecord)}
                  className="rounded-full border border-[#D9E3EC] px-3 py-1.5 text-xs font-semibold text-[#071F5E]"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadDiagnosisWord(selectedDiagnosisRecord)}
                  className="rounded-full border border-[#D9E3EC] px-3 py-1.5 text-xs font-semibold text-[#071F5E]"
                >
                  Word
                </button>
                <button
                  type="button"
                  onClick={() => downloadDiagnosisExcel(selectedDiagnosisRecord)}
                  className="rounded-full border border-[#D9E3EC] px-3 py-1.5 text-xs font-semibold text-[#071F5E]"
                >
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => downloadDiagnosisCsv(selectedDiagnosisRecord)}
                  className="rounded-full border border-[#D9E3EC] px-3 py-1.5 text-xs font-semibold text-[#071F5E]"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDiagnosisRecord(null)}
                  className="rounded-full border border-[#D9E3EC] px-3 py-1.5 text-xs font-semibold text-[#071F5E]"
                >
                  {t.close}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F7FAFB] p-4">
              <div className="grid gap-2">
                {getOrderedAnswerEntries(selectedDiagnosisRecord.profile.diagnosis?.answers).map(([key, value]) => (
                  <div key={key} className="text-sm text-[#2F3336]/85">
                    <span className="font-semibold text-[#071F5E]">
                      {getDiagnosisAnswerLabel(key, selectedDiagnosisRecord.profile.diagnosis?.locale || selectedDiagnosisRecord.profile.locale)}:
                    </span>{' '}
                    {formatProjectAnswerValue(value, selectedDiagnosisRecord.profile.diagnosis?.locale || localeKey)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
