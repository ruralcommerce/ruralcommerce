'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import {
  patchCandidateSession,
  readCandidateSession,
  writeCandidateSession,
} from '@/lib/project-candidate-session';
import { mapProjectApiMessage } from '@/lib/project-locale';

type LocaleKey = 'es' | 'pt-BR' | 'en';

type CandidateRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    email: string;
  };
  profile: {
    name?: string;
    locale?: string;
    agreement?: {
      signed?: boolean;
    };
  };
};

type Question = {
  id: string;
  section: 1 | 2 | 3 | 4 | 5;
  subcategory: string;
  prompt: string;
  kind: 'select' | 'percent' | 'binary';
  options?: string[];
};

const questions: Question[] = [
  {
    id: 'q1',
    section: 1,
    subcategory: 'Formalización',
    prompt: '¿Cuál es el estatus legal y tributario actual del negocio?',
    kind: 'select',
    options: [
      '1 - Ninguno',
      '2 - Parcial / en trámite',
      '3 - Tributario básico',
      '4 - Casi completo',
      '5 - Totalmente formalizado (Permisos, Patente, Tributos)',
    ],
  },
  {
    id: 'q2',
    section: 1,
    subcategory: 'Planificación',
    prompt: '¿Cuenta con un plan de negocio o mapa estratégico escrito para los próximos 1-3 años?',
    kind: 'select',
    options: [
      '1 - No hay',
      '2 - Muy informal',
      '3 - Ideas mentales claras',
      '4 - Borrador avanzado',
      '5 - Documento escrito y en uso',
    ],
  },
  {
    id: 'q3',
    section: 1,
    subcategory: 'Bancarización',
    prompt: '¿El negocio cuenta con cuentas bancarias comerciales separadas de las finanzas personales del dueño?',
    kind: 'binary',
  },
  {
    id: 'q4',
    section: 1,
    subcategory: 'Inclusión y Equidad',
    prompt: '¿Porcentaje de mujeres y jóvenes (menores de 35) en roles de toma de decisión en el negocio?',
    kind: 'percent',
  },

  {
    id: 'q5',
    section: 2,
    subcategory: 'Registros Contables',
    prompt: '¿Cómo registra los ingresos, gastos y cuentas por cobrar/pagar?',
    kind: 'select',
    options: [
      '1 - Mental',
      '2 - Cuaderno',
      '3 - Excel básico',
      '4 - Plantilla avanzada',
      '5 - Software contable',
    ],
  },
  {
    id: 'q6',
    section: 2,
    subcategory: 'Estructura de Costos',
    prompt: '¿Conoce exactamente el costo unitario de producción (materiales, mano de obra, indirectos)?',
    kind: 'select',
    options: [
      '1 - Al cálculo / ojo',
      '2 - Referencia simple',
      '3 - Estimado parcial',
      '4 - Casi completo',
      '5 - Costeo exacto documentado',
    ],
  },
  {
    id: 'q7',
    section: 2,
    subcategory: 'Fijación de Precios',
    prompt: '¿Cómo define el precio de venta de sus productos?',
    kind: 'select',
    options: [
      '1 - Copiando al vecino',
      '2 - Aproximado',
      '3 - En base a costos básicos',
      '4 - Costos + margen parcial',
      '5 - Estrategia de margen definida',
    ],
  },
  {
    id: 'q8',
    section: 2,
    subcategory: 'Flujo de Caja',
    prompt: '¿Realiza una proyección o seguimiento de su flujo de caja mensual para evitar quedarse sin efectivo?',
    kind: 'select',
    options: [
      '1 - Nunca',
      '2 - Muy ocasional',
      '3 - A veces / empírico',
      '4 - Casi mensual',
      '5 - Herramienta mensual estricta',
    ],
  },
  {
    id: 'q9',
    section: 2,
    subcategory: 'Acceso a Crédito',
    prompt: '¿Cuál es su capacidad demostrable actual para acceder a un crédito bancario para capital de trabajo?',
    kind: 'select',
    options: [
      '1 - Nula (informal)',
      '2 - Muy limitada',
      '3 - Limitada / microfinancieras',
      '4 - Moderada',
      '5 - Alta (bancos comerciales)',
    ],
  },

  {
    id: 'q10',
    section: 3,
    subcategory: 'Estandarización',
    prompt: '¿Los procesos productivos (receta, secado, fermentación) están documentados para que los siga cualquier empleado?',
    kind: 'select',
    options: [
      '1 - El conocimiento está en 1 persona',
      '2 - Parcial y verbal',
      '3 - Procesos básicos',
      '4 - Casi completos',
      '5 - Manuales completos',
    ],
  },
  {
    id: 'q11',
    section: 3,
    subcategory: 'Pérdidas Post-Cosecha',
    prompt: '¿Qué porcentaje de biomasa, café o materia prima se desperdicia, merma o pudre en el procesamiento?',
    kind: 'percent',
  },
  {
    id: 'q12',
    section: 3,
    subcategory: 'Consistencia de Calidad',
    prompt: '¿Qué porcentaje del producto final sale defectuoso o es rechazado por el cliente por no cumplir calidad?',
    kind: 'percent',
  },
  {
    id: 'q13',
    section: 3,
    subcategory: 'Manejo de Inventarios',
    prompt: '¿Cómo controla la cantidad de materia prima y producto terminado almacenado?',
    kind: 'select',
    options: [
      '1 - Visual',
      '2 - Conteo ocasional',
      '3 - Inventario físico mensual',
      '4 - Control semanal',
      '5 - Sistema en tiempo real',
    ],
  },
  {
    id: 'q14',
    section: 3,
    subcategory: 'Economía Circular',
    prompt: '¿Qué hace actualmente con los subproductos o residuos (ej. pulpa de café)?',
    kind: 'select',
    options: [
      '1 - Se botan / contaminan',
      '2 - Uso ocasional',
      '3 - Compostaje básico',
      '4 - Reuso parcial',
      '5 - Se transforma en subproducto vendible',
    ],
  },
  {
    id: 'q15',
    section: 3,
    subcategory: 'Eficiencia Energética',
    prompt: '¿Lleva algún registro o realiza acciones concretas para optimizar el consumo de agua y electricidad?',
    kind: 'binary',
  },

  {
    id: 'q16',
    section: 4,
    subcategory: 'Competencia Digital',
    prompt: '¿Nivel de habilidad del equipo para usar computadoras, smartphones y aplicaciones en el trabajo?',
    kind: 'select',
    options: [
      '1 - Bajo',
      '2 - Básico inicial',
      '3 - Intermedio',
      '4 - Intermedio alto',
      '5 - Avanzado',
    ],
  },
  {
    id: 'q17',
    section: 4,
    subcategory: 'Infraestructura',
    prompt: '¿Dispone de conexión a Internet estable en las áreas de producción/finca para transmitir datos?',
    kind: 'select',
    options: [
      '1 - Sin señal',
      '2 - Muy inestable',
      '3 - Datos móviles irregulares',
      '4 - Estable parcial',
      '5 - WiFi estable',
    ],
  },
  {
    id: 'q18',
    section: 4,
    subcategory: 'Trazabilidad Básica',
    prompt: '¿Si un cliente reclama por un lote, puede rastrear la fecha exacta, peso y condiciones de cuándo se produjo?',
    kind: 'select',
    options: [
      '1 - Imposible',
      '2 - Muy difícil',
      '3 - Toma mucho tiempo buscar papeles',
      '4 - Parcialmente rastreable',
      '5 - Trazabilidad digital rápida',
    ],
  },
  {
    id: 'q19',
    section: 4,
    subcategory: 'Monitoreo de Variables',
    prompt: '¿Cómo mide variables ambientales críticas (Humedad, Temperatura) en secado/almacenamiento?',
    kind: 'select',
    options: [
      '1 - No se mide',
      '2 - Al tacto / ojo',
      '3 - Termómetro manual',
      '4 - Registro regular',
      '5 - Sensores automáticos / IoT',
    ],
  },
  {
    id: 'q20',
    section: 4,
    subcategory: 'Uso de Datos',
    prompt: '¿Con qué frecuencia usa datos registrados (ventas, costos, producción) para tomar decisiones de negocio?',
    kind: 'select',
    options: [
      '1 - Nunca',
      '2 - Ocasional',
      '3 - Mensual',
      '4 - Semanal',
      '5 - Semanal / Diario',
    ],
  },

  {
    id: 'q21',
    section: 5,
    subcategory: 'Canales de Venta',
    prompt: '¿Cuál es su nivel de dependencia de intermediarios (coyotes) para vender su producto?',
    kind: 'select',
    options: [
      '1 - Dependencia total',
      '2 - Alta dependencia',
      '3 - Ventas mixtas',
      '4 - Mayoría directa',
      '5 - Venta directa al cliente / mercado final',
    ],
  },
  {
    id: 'q22',
    section: 5,
    subcategory: 'Empaque y Presentación',
    prompt: '¿El producto cumple con requisitos de anaquel (etiqueta, código de barras, tabla nutricional, sellos)?',
    kind: 'select',
    options: [
      '1 - A granel / bolsa transparente',
      '2 - Empaque básico',
      '3 - Etiqueta básica',
      '4 - Empaque semiprofesional',
      '5 - Empaque profesional retail',
    ],
  },
  {
    id: 'q23',
    section: 5,
    subcategory: 'Preparación Exportadora (EEUU)',
    prompt: '¿Conoce y cumple con las normativas internacionales de inocuidad como FDA o FSMA?',
    kind: 'select',
    options: [
      '1 - Desconoce totalmente',
      '2 - Conocimiento inicial',
      '3 - Conoce pero no cumple',
      '4 - En proceso avanzado',
      '5 - Cumple o está en proceso avanzado',
    ],
  },
  {
    id: 'q24',
    section: 5,
    subcategory: 'Estrategia de Ventas Conjunta',
    prompt: '¿Nivel actual de colaboración con otros productores para consolidar volumen y negociar mejores precios?',
    kind: 'select',
    options: [
      '1 - Compite / aislado',
      '2 - Contacto mínimo',
      '3 - Asociatividad informal',
      '4 - Acuerdos parciales',
      '5 - Contratos formales de red comercial',
    ],
  },
  {
    id: 'q25',
    section: 5,
    subcategory: 'Marketing y Marca',
    prompt: '¿Tiene una marca registrada, catálogo digital de productos o presencia comercial en internet (redes/web)?',
    kind: 'select',
    options: [
      '1 - Ninguno',
      '2 - Presencia mínima',
      '3 - Solo redes básicas',
      '4 - Marca en desarrollo',
      '5 - Marca fuerte con catálogo formal y ventas digitales',
    ],
  },
  {
    id: 'q26',
    section: 5,
    subcategory: 'Satisfacción del Cliente',
    prompt: '¿Tiene algún mecanismo formal para medir la satisfacción y recibir retroalimentación de sus compradores?',
    kind: 'binary',
  },
];

const sectionTitles: Record<LocaleKey, Record<number, string>> = {
  es: {
    1: '1. Perfil Empresarial y Estrategia',
    2: '2. Gestión Financiera y Administrativa',
    3: '3. Operaciones, Productividad y Calidad',
    4: '4. Transformación Digital e IoT',
    5: '5. Comercialización, Redes y Exportación',
  },
  'pt-BR': {
    1: '1. Perfil Empresarial y Estratégia',
    2: '2. Gestão Financeira e Administrativa',
    3: '3. Operações, Produtividade e Qualidade',
    4: '4. Transformação Digital e IoT',
    5: '5. Comercialização, Redes e Exportação',
  },
  en: {
    1: '1. Business Profile and Strategy',
    2: '2. Financial and Administrative Management',
    3: '3. Operations, Productivity and Quality',
    4: '4. Digital Transformation and IoT',
    5: '5. Commercialization, Networks and Export',
  },
};

const copy: Record<
  LocaleKey,
  {
    eyebrow: string;
    introTitle: string;
    introText: string;
    introNote: string;
    loginTitle: string;
    loginText: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    loginCta: string;
    blockedTitle: string;
    blockedText: string;
    agreementRequiredTitle: string;
    agreementRequiredText: string;
    goToConvenio: string;
    continue: string;
    previous: string;
    submit: string;
    submitting: string;
    success: string;
    goToProfile: string;
    selectPlaceholder: string;
    yes: string;
    no: string;
    percentPlaceholder: string;
    requiredError: string;
    stepIncompleteError: string;
  }
> = {
  es: {
    eyebrow: 'Diagnóstico',
    introTitle: 'Diagnóstico inicial del emprendimiento',
    introText: 'Completa este diagnóstico para priorizar acciones y construir un plan de apoyo claro.',
    introNote: 'Solo participantes aprobados pueden enviar esta etapa.',
    loginTitle: 'Acceso al diagnóstico',
    loginText: 'Para continuar, debes iniciar sesión y tener tu inscripción aprobada.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loginCta: 'Entrar al diagnóstico',
    blockedTitle: 'Inscripción no aprobada',
    blockedText: 'Tu inscripción aún no está aprobada. Cuando el estado cambie a aprobado, podrás completar el diagnóstico.',
    agreementRequiredTitle: 'Firma el convenio primero',
    agreementRequiredText: 'Tu perfil fue aprobado. Antes de completar el diagnóstico, debes firmar el convenio de participación (derechos de imagen y compromiso con el proyecto).',
    goToConvenio: 'Firmar el convenio',
    continue: 'Continuar',
    previous: 'Anterior',
    submit: 'Enviar diagnóstico',
    submitting: 'Enviando...',
    success: 'Diagnóstico enviado correctamente.',
    goToProfile: 'Ver mi perfil',
    selectPlaceholder: 'Seleccione una opción',
    yes: 'Sí',
    no: 'No',
    percentPlaceholder: 'Ingrese %',
    requiredError: 'Faltan respuestas. Te llevamos a la primera pregunta incompleta.',
    stepIncompleteError: 'Completa todas las respuestas de esta sección antes de continuar.',
  },
  'pt-BR': {
    eyebrow: 'Diagnóstico',
    introTitle: 'Diagnóstico inicial do empreendimento',
    introText: 'Preencha este diagnóstico para priorizar ações e construir um plano de apoio claro.',
    introNote: 'Apenas participantes aprovados podem enviar esta etapa.',
    loginTitle: 'Acesso ao diagnóstico',
    loginText: 'Para continuar, você precisa fazer login e ter sua inscrição aprovada.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    forgotPassword: 'Esqueceu sua senha?',
    loginCta: 'Entrar no diagnóstico',
    blockedTitle: 'Inscrição não aprovada',
    blockedText: 'Sua inscrição ainda não está aprovada. Quando o status mudar para aprovado, você poderá completar o diagnóstico.',
    agreementRequiredTitle: 'Assine o convênio primeiro',
    agreementRequiredText: 'Seu perfil foi aprovado. Antes de preencher o diagnóstico, você precisa assinar o convênio de participação (direitos de imagem e compromisso com o projeto).',
    goToConvenio: 'Assinar o convênio',
    continue: 'Continuar',
    previous: 'Anterior',
    submit: 'Enviar diagnóstico',
    submitting: 'Enviando...',
    success: 'Diagnóstico enviado com sucesso.',
    goToProfile: 'Ver meu perfil',
    selectPlaceholder: 'Selecione uma opção',
    yes: 'Sim',
    no: 'Não',
    percentPlaceholder: 'Informe %',
    requiredError: 'Faltam respostas. Levamos você à primeira pergunta incompleta.',
    stepIncompleteError: 'Complete todas as respostas desta seção antes de continuar.',
  },
  en: {
    eyebrow: 'Diagnosis',
    introTitle: 'Initial venture diagnosis',
    introText: 'Complete this diagnosis to prioritize actions and build a clear support plan.',
    introNote: 'Only approved participants can submit this step.',
    loginTitle: 'Diagnosis access',
    loginText: 'To continue, you must be logged in and have your application approved.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot your password?',
    loginCta: 'Enter diagnosis',
    blockedTitle: 'Application not approved',
    blockedText: 'Your application is not approved yet. Once approved, you can complete the diagnosis.',
    agreementRequiredTitle: 'Sign the agreement first',
    agreementRequiredText: 'Your profile was approved. Before completing the diagnosis, you must sign the participation agreement (image rights and project commitment).',
    goToConvenio: 'Sign the agreement',
    continue: 'Continue',
    previous: 'Previous',
    submit: 'Submit diagnosis',
    submitting: 'Submitting...',
    success: 'Diagnosis submitted successfully.',
    goToProfile: 'View my profile',
    selectPlaceholder: 'Select an option',
    yes: 'Yes',
    no: 'No',
    percentPlaceholder: 'Enter %',
    requiredError: 'Some answers are missing. We took you to the first incomplete question.',
    stepIncompleteError: 'Complete all answers in this section before continuing.',
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function buildEmptyAnswers() {
  return Object.fromEntries(questions.map((question) => [question.id, ''])) as Record<string, string>;
}

function isAnswerFilled(value: string | undefined) {
  return String(value || '').trim().length > 0;
}

function stepIndexForQuestion(questionId: string) {
  const question = questions.find((item) => item.id === questionId);
  return question ? question.section : 0;
}

export function ProjectDiagnosisForm({
  locale,
  teamAssist,
}: {
  locale: string;
  teamAssist?: {
    token: string;
    memberName: string;
    record: CandidateRecord;
  };
}) {
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const feedbackRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState(teamAssist?.record.user.email || '');
  const [password, setPassword] = useState('');
  const [record, setRecord] = useState<CandidateRecord | null>(teamAssist?.record ?? null);
  const [answers, setAnswers] = useState<Record<string, string>>(buildEmptyAnswers());
  const [currentStep, setCurrentStep] = useState(0);
  const [incompleteIds, setIncompleteIds] = useState<string[]>([]);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sections = useMemo(
    () => [1, 2, 3, 4, 5].map((section) => ({ section, items: questions.filter((question) => question.section === section) })),
    []
  );

  const totalSteps = 6;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const stepTitle = isFirstStep ? t.introTitle : sectionTitles[localeKey][currentStep];

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setIncompleteIds((prev) => prev.filter((id) => id !== key));
  };

  const isApproved = record?.status === 'approved';
  const agreementSigned = record?.profile?.agreement?.signed === true;

  const showFeedback = (message: string, kind: 'error' | 'success' = 'error') => {
    if (kind === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const hydrateFromSession = () => {
    const parsed = readCandidateSession();
    if (!parsed?.email || parsed.status !== 'approved' || !parsed.id) return;
    setEmail(parsed.email);
    if (parsed.password) setPassword(parsed.password);
    setRecord({
      id: parsed.id,
      status: 'approved',
      user: { email: parsed.email },
      profile: {
        name: parsed.name || '',
        locale: parsed.locale || localeKey,
        agreement: { signed: parsed.agreementSigned === true },
      },
    });
  };

  useEffect(() => {
    if (teamAssist) {
      setRecord(teamAssist.record);
      setEmail(teamAssist.record.user.email);
      const existing = (teamAssist.record.profile as { diagnosis?: { answers?: Record<string, string> } }).diagnosis
        ?.answers;
      if (existing) {
        setAnswers((prev) => ({ ...prev, ...existing }));
      }
      return;
    }
    hydrateFromSession();
  }, [teamAssist]);

  const handleLogin = async () => {
    setIsCheckingLogin(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/auth/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.loginText));
        return;
      }
      const loadedRecord = payload.record as CandidateRecord;
      setRecord(loadedRecord);
      if (loadedRecord.status !== 'approved') {
        return;
      }
      writeCandidateSession({
        id: loadedRecord.id,
        email: loadedRecord.user.email,
        password,
        status: loadedRecord.status,
        locale: loadedRecord.profile.locale || localeKey,
        name: loadedRecord.profile.name || '',
        agreementSigned: loadedRecord.profile.agreement?.signed === true,
      });
    } catch {
      setError(t.loginText);
    } finally {
      setIsCheckingLogin(false);
    }
  };

  const incompleteQuestions = () => questions.filter((question) => !isAnswerFilled(answers[question.id]));

  const currentSectionIncomplete = () => {
    if (isFirstStep) return [];
    const section = sections[currentStep - 1];
    return section.items.filter((question) => !isAnswerFilled(answers[question.id])).map((question) => question.id);
  };

  const goToNextStep = () => {
    if (!isFirstStep) {
      const missing = currentSectionIncomplete();
      if (missing.length > 0) {
        setIncompleteIds(missing);
        showFeedback(t.stepIncompleteError);
        return;
      }
    }
    setError('');
    setIncompleteIds([]);
    setCurrentStep((value) => Math.min(totalSteps - 1, value + 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!record || record.status !== 'approved') {
      showFeedback(t.blockedText);
      return;
    }
    const missing = incompleteQuestions();
    if (missing.length > 0) {
      setIncompleteIds(missing.map((question) => question.id));
      setCurrentStep(stepIndexForQuestion(missing[0].id));
      showFeedback(t.requiredError);
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setIncompleteIds([]);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (teamAssist?.token) {
        headers.Authorization = `Bearer ${teamAssist.token}`;
      }

      const response = await fetch('/api/projeto/diagnosticos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          candidateId: record.id,
          email: record.user.email,
          locale: localeKey,
          answers,
          teamAssist: Boolean(teamAssist),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        showFeedback(mapProjectApiMessage(payload.message, localeKey, t.requiredError));
        return;
      }
      patchCandidateSession({ id: record.id, email: record.user.email });
      showFeedback(t.success, 'success');
    } catch {
      showFeedback(t.requiredError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) {
    return (
      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#E6EBF1] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.loginTitle}</h2>
        <p className="mt-1 text-sm text-[#2F3336]/75">{t.loginText}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#071F5E]">{t.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#071F5E]">{t.passwordLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          disabled={isCheckingLogin}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
        >
          {isCheckingLogin ? `${t.loginCta}...` : t.loginCta}
        </button>
        <a
          href={`/${locale}/projeto/recuperar-senha${email ? `?email=${encodeURIComponent(email)}` : ''}`}
          className="mt-3 inline-flex text-sm font-semibold text-[#1D6359] underline"
        >
          {t.forgotPassword}
        </a>
        {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#E6EBF1] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.blockedTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.blockedText}</p>
        <a
          href={`/${locale}/perfil`}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-[#D9E3EC] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
        >
          {t.goToProfile}
        </a>
      </div>
    );
  }

  if (!agreementSigned && !teamAssist) {
    return (
      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#E6EBF1] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.agreementRequiredTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.agreementRequiredText}</p>
        <a
          href={`/${locale}/projeto/convenio`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
        >
          {t.goToConvenio}
        </a>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-0">
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white px-2 py-1.5 sm:px-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
            <p className="text-xs text-[#2F3336]/60">{stepTitle}</p>
          </div>
          <div className="text-xs font-medium text-[#2F3336]/60">{currentStep + 1}/{totalSteps}</div>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[#1D6359] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] bg-white">
        <div
          className="flex h-full w-full items-stretch transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col rounded-[22px] bg-white p-2.5 sm:p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
                <ClipboardList size={22} />
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[#071F5E]">{t.introTitle}</h2>
              <p className="mt-1.5 text-sm leading-5 text-[#2F3336]/75">{t.introText}</p>
              <p className="mt-1 text-sm leading-5 text-[#2F3336]/75">{t.introNote}</p>
              <div className="mt-3 rounded-2xl bg-[#F6FAFA] p-2.5 text-sm text-[#2F3336]/80">
                {record.profile.name ? `${record.profile.name} · ` : ''}{record.user.email}
              </div>
            </div>
          </div>

          {sections.map(({ section, items }) => (
            <div key={section} className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
              <div className="flex h-full flex-col rounded-[22px] bg-white p-2.5 sm:p-3">
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {items.map((question) => {
                    const isIncomplete = incompleteIds.includes(question.id);
                    return (
                      <div
                        key={question.id}
                        className={`rounded-2xl border bg-[#FBFCFD] p-2.5 ${
                          isIncomplete ? 'border-red-300 ring-1 ring-red-200' : 'border-[#E6EBF1]'
                        }`}
                      >
                        <p className="text-sm leading-5 text-[#071F5E]">
                          <span className="font-semibold text-[#1D6359]">{question.subcategory}:</span> {question.prompt}
                        </p>

                        {question.kind === 'select' ? (
                          <select
                            value={answers[question.id] || ''}
                            onChange={(e) => setAnswer(question.id, e.target.value)}
                            className="mt-2 w-full rounded-xl border border-[#D9E3EC] bg-white px-3 py-2 text-sm"
                          >
                            <option value="" disabled>
                              {t.selectPlaceholder}
                            </option>
                            {(question.options || []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : null}

                        {question.kind === 'binary' ? (
                          <select
                            value={answers[question.id] || ''}
                            onChange={(e) => setAnswer(question.id, e.target.value)}
                            className="mt-2 w-full rounded-xl border border-[#D9E3EC] bg-white px-3 py-2 text-sm"
                          >
                            <option value="" disabled>
                              {t.selectPlaceholder}
                            </option>
                            <option value={t.yes}>{t.yes}</option>
                            <option value={t.no}>{t.no}</option>
                          </select>
                        ) : null}

                        {question.kind === 'percent' ? (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={answers[question.id] || ''}
                              onChange={(e) => setAnswer(question.id, e.target.value)}
                              placeholder={t.percentPlaceholder}
                              className="w-full rounded-xl border border-[#D9E3EC] bg-white px-3 py-2 text-sm"
                            />
                            <span className="text-sm text-[#2F3336]/70">%</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={feedbackRef} className="mt-2 flex-none space-y-2">
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {success ? (
          <div className="rounded-2xl bg-[#EEF7F7] p-3 text-sm text-[#1D6359]">
            <p>{success}</p>
            <a href={`/${locale}/perfil`} className="mt-2 inline-flex font-semibold underline">
              {t.goToProfile}
            </a>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-none items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setError('');
            setCurrentStep((value) => Math.max(0, value - 1));
          }}
          disabled={isFirstStep || isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-[#D9E3EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
        >
          {t.previous}
        </button>

        {isLastStep ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextStep}
            className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E]"
          >
            {t.continue}
          </button>
        )}
      </div>
    </form>
  );
}
