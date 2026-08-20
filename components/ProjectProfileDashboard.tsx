'use client';

import { useEffect, useState } from 'react';
import {
  formatProjectAnswerValue,
  formatProjectDate,
  getProjectLocaleKey,
  getProjectStatusLabel,
  mapProjectApiMessage,
  type ProjectLocaleKey,
} from '@/lib/project-locale';
import {
  readCandidateSession,
  writeCandidateSession,
} from '@/lib/project-candidate-session';
import { ProjectPushOptIn } from '@/components/ProjectPushOptIn';
import { ProjectAgreementDownloadButton } from '@/components/ProjectAgreementDownloadButton';
import { PROJECT_NAME } from '@/lib/project-brand';

type EnrollmentRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  user: {
    email: string;
    username: string;
    accessStatus: string;
  };
  profile: {
    name: string;
    phone?: string;
    organization?: string;
    city?: string;
    role?: string;
    interest?: string;
    message?: string;
    answers?: Record<string, unknown>;
    locale?: string;
    marketingConsent?: boolean;
    agreement?: {
      signed?: boolean;
      signedAt?: string;
      fullName?: string;
      locale?: string;
    };
  };
};

const questionLabels: Record<ProjectLocaleKey, Record<string, string>> = {
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

const uiCopy = {
  es: {
    eyebrow: 'Mi perfil',
    title: 'Sigue tu inscripción y los próximos pasos',
    emailPlaceholder: 'Ingresa tu correo electrónico',
    passwordPlaceholder: 'Ingresa tu contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loginCta: 'Entrar a la intranet del candidato',
    loading: 'Buscando información...',
    statusSection: 'Estado del usuario',
    emailLabel: 'Correo',
    createdLabel: 'Creado el',
    accessLabel: 'Acceso',
    projectInfo: 'Información del proyecto',
    organization: 'Organización',
    city: 'Ciudad',
    profile: 'Perfil',
    interest: 'Interés',
    noMessage: 'Sin mensaje adicional.',
    formAnswers: 'Respuestas del formulario',
    diagnosticCta: 'Ir al diagnóstico',
    convenioSignedTitle: 'Convenio firmado',
    convenioSignedText: 'Tu convenio está registrado. Puedes descargarlo cuando lo necesites.',
    convenioSignedBy: 'Firmado por',
    convenioSignedAt: 'Fecha de firma',
    convenioCta: 'Ir a firmar el convenio',
    convenioBoxTitle: 'Siguiente paso: convenio de participación',
    convenioPending: `Tu perfil fue aprobado para ${PROJECT_NAME}. Debes firmar el convenio en línea (reglas del programa) para desbloquear el diagnóstico.`,
    convenioSteps: [
      'Haz clic en el botón de abajo.',
      'Inicia sesión con el correo y contraseña de tu inscripción (si te lo pide).',
      'Lee el convenio, marca las 4 casillas y firma con tu nombre completo.',
    ],
    commsTitle: 'Comunicaciones del proyecto',
    commsOn: 'Recibes actualizaciones por e-mail, push y WhatsApp (según disponibilidad).',
    commsOff: 'No recibes comunicaciones del proyecto.',
    commsRevoke: 'Dejar de recibir comunicaciones',
    commsGrant: 'Activar comunicaciones',
    commsUpdating: 'Actualizando...',
    accessActive: 'Activo',
    accessPending: 'Pendiente',
    errorLoad: 'No fue posible cargar el perfil.',
    errorLoadGeneric: 'Error al cargar el perfil.',
  },
  'pt-BR': {
    eyebrow: 'Meu perfil',
    title: 'Acompanhe sua inscrição e próximos passos',
    emailPlaceholder: 'Digite seu e-mail',
    passwordPlaceholder: 'Digite sua senha',
    forgotPassword: 'Esqueceu sua senha?',
    loginCta: 'Entrar na intranet do candidato',
    loading: 'Buscando informações...',
    statusSection: 'Status do usuário',
    emailLabel: 'E-mail',
    createdLabel: 'Criado em',
    accessLabel: 'Acesso',
    projectInfo: 'Informações do projeto',
    organization: 'Organização',
    city: 'Cidade',
    profile: 'Perfil',
    interest: 'Interesse',
    noMessage: 'Sem mensagem adicional.',
    formAnswers: 'Respostas do formulário',
    diagnosticCta: 'Ir para o diagnóstico',
    convenioSignedTitle: 'Convênio assinado',
    convenioSignedText: 'Seu convênio está registrado. Você pode baixá-lo quando precisar.',
    convenioSignedBy: 'Assinado por',
    convenioSignedAt: 'Data da assinatura',
    convenioCta: 'Ir assinar o convênio',
    convenioBoxTitle: 'Próxima etapa: convênio de participação',
    convenioPending: `Seu perfil foi aprovado no ${PROJECT_NAME}. É preciso assinar o convênio online (regras do programa) para desbloquear o diagnóstico.`,
    convenioSteps: [
      'Clique no botão abaixo.',
      'Entre com o e-mail e senha da inscrição (se solicitado).',
      'Leia o convênio, marque as 4 caixas e assine com seu nome completo.',
    ],
    commsTitle: 'Comunicações do projeto',
    commsOn: 'Você recebe atualizações por e-mail, push e WhatsApp (conforme disponibilidade).',
    commsOff: 'Você não recebe comunicações do projeto.',
    commsRevoke: 'Deixar de receber comunicações',
    commsGrant: 'Ativar comunicações',
    commsUpdating: 'Atualizando...',
    accessActive: 'Ativo',
    accessPending: 'Pendente',
    errorLoad: 'Não foi possível carregar o perfil.',
    errorLoadGeneric: 'Erro ao carregar o perfil.',
  },
  en: {
    eyebrow: 'My profile',
    title: 'Track your application and next steps',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot your password?',
    loginCta: 'Enter candidate intranet',
    loading: 'Loading information...',
    statusSection: 'User status',
    emailLabel: 'Email',
    createdLabel: 'Created on',
    accessLabel: 'Access',
    projectInfo: 'Project information',
    organization: 'Organization',
    city: 'City',
    profile: 'Profile',
    interest: 'Interest',
    noMessage: 'No additional message.',
    formAnswers: 'Form answers',
    diagnosticCta: 'Go to diagnosis',
    convenioSignedTitle: 'Agreement signed',
    convenioSignedText: 'Your agreement is on record. You can download it whenever you need it.',
    convenioSignedBy: 'Signed by',
    convenioSignedAt: 'Signed on',
    convenioCta: 'Go sign the agreement',
    convenioBoxTitle: 'Next step: participation agreement',
    convenioPending: `Your profile was approved for ${PROJECT_NAME}. You must sign the agreement online (program rules) to unlock the diagnosis.`,
    convenioSteps: [
      'Click the button below.',
      'Log in with your application email and password (if prompted).',
      'Read the agreement, check all 4 boxes and sign with your full name.',
    ],
    commsTitle: 'Project communications',
    commsOn: 'You receive updates by email, push and WhatsApp (when available).',
    commsOff: 'You do not receive project communications.',
    commsRevoke: 'Stop receiving communications',
    commsGrant: 'Enable communications',
    commsUpdating: 'Updating...',
    accessActive: 'Active',
    accessPending: 'Pending',
    errorLoad: 'Could not load profile.',
    errorLoadGeneric: 'Error loading profile.',
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

function getAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = questionLabels[getProjectLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

export function ProjectProfileDashboard({
  locale,
  initialEmail = '',
}: {
  locale: string;
  initialEmail?: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = uiCopy[localeKey];

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [record, setRecord] = useState<EnrollmentRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [commsLoading, setCommsLoading] = useState(false);
  const answerEntries = record ? getOrderedAnswerEntries(record.profile.answers) : [];

  const loadRecord = async (targetEmail: string, targetPassword?: string) => {
    const authPassword = targetPassword ?? password;
    if (!authPassword) return;
    setLoading(true);
    setError('');
    setRecord(null);
    try {
      const response = await fetch('/api/projeto/auth/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: authPassword }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorLoad));
        return;
      }
      const loadedRecord = payload.record || null;
      setRecord(loadedRecord);
      if (loadedRecord) {
        writeCandidateSession({
          id: loadedRecord.id,
          email: loadedRecord.user?.email || targetEmail,
          password: authPassword,
          status: loadedRecord.status,
          locale: loadedRecord.profile?.locale || localeKey,
          name: loadedRecord.profile?.name || '',
          agreementSigned: loadedRecord.profile?.agreement?.signed === true,
        });
      }
    } catch {
      setError(t.errorLoadGeneric);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = readCandidateSession();
    if (session?.email) setEmail(session.email);
    if (session?.password) setPassword(session.password);
    if (session?.email && session.password) {
      void loadRecord(session.email, session.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayLocale = record?.profile?.locale || localeKey;

  function getAccessLabel(accessStatus: string) {
    if (accessStatus === 'active') return t.accessActive;
    if (accessStatus === 'pending') return t.accessPending;
    return accessStatus;
  }

  const updateConsent = async (action: 'grant' | 'revoke') => {
    if (!record) return;
    setCommsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: record.user.email, password, action }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.errorLoad));
        return;
      }
      setRecord(payload.record as EnrollmentRecord);
    } catch {
      setError(t.errorLoadGeneric);
    } finally {
      setCommsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#071F5E] p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
      </div>

      {!record ? (
        <div className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="rounded-2xl border border-[#D9E3EC] px-4 py-3"
            />
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="rounded-2xl border border-[#D9E3EC] px-4 py-3"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadRecord(email)}
              className="rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E]"
            >
              {t.loginCta}
            </button>
            <a
              href={`/${localeKey}/projeto/recuperar-senha${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-sm font-semibold text-[#1D6359] underline"
            >
              {t.forgotPassword}
            </a>
          </div>
        </div>
      ) : null}

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? <p className="text-sm text-[#2F3336]/70">{t.loading}</p> : null}

      {record ? (
        <div className="space-y-4">
          <section className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#1D6359]">{t.statusSection}</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#071F5E]">{record.profile.name}</h2>
              </div>
              <span className="rounded-full bg-[#EEF7F7] px-3 py-1 text-sm font-semibold text-[#1D6359]">
                {getProjectStatusLabel(record.status, localeKey)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.emailLabel}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.createdLabel}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{formatProjectDate(record.createdAt, localeKey)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.accessLabel}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{getAccessLabel(record.user.accessStatus)}</p>
              </div>
            </div>

            {record.status === 'approved' ? (
              record.profile.agreement?.signed ? (
                <div className="mt-4 rounded-2xl border border-[#CFE8E8] bg-[#F3FAFA] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D6359]">{t.convenioSignedTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[#2F3336]/85">{t.convenioSignedText}</p>
                  <p className="mt-2 text-sm text-[#2F3336]/85">
                    <span className="font-semibold text-[#071F5E]">{t.convenioSignedBy}:</span>{' '}
                    {record.profile.agreement.fullName || record.profile.name || record.user.email}
                  </p>
                  {record.profile.agreement.signedAt ? (
                    <p className="mt-1 text-sm text-[#2F3336]/85">
                      <span className="font-semibold text-[#071F5E]">{t.convenioSignedAt}:</span>{' '}
                      {formatProjectDate(record.profile.agreement.signedAt, localeKey)}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ProjectAgreementDownloadButton
                      locale={localeKey}
                      input={{
                        fullName: record.profile.agreement.fullName || record.profile.name || record.user.email,
                        email: record.user.email,
                        organization: record.profile.organization,
                        signedAt: record.profile.agreement.signedAt || record.updatedAt,
                        locale: record.profile.agreement.locale || record.profile.locale || localeKey,
                      }}
                    />
                    <a
                      href={`/${localeKey}/projeto/diagnostico`}
                      className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
                    >
                      {t.diagnosticCta}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#CFE8E8] bg-[#F3FAFA] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D6359]">{t.convenioBoxTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[#2F3336]/85">{t.convenioPending}</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[#2F3336]/85">
                    {t.convenioSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <a
                    href={`/${localeKey}/projeto/convenio`}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
                  >
                    {t.convenioCta}
                  </a>
                </div>
              )
            ) : null}

            <ProjectPushOptIn
              locale={localeKey}
              email={record.user.email}
              password={password}
              marketingConsent={record.profile.marketingConsent}
            />

            <div className="mt-4 rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{t.commsTitle}</p>
              <p className="mt-1 text-sm text-[#2F3336]/80">
                {record.profile.marketingConsent ? t.commsOn : t.commsOff}
              </p>
              <button
                type="button"
                disabled={commsLoading || !password}
                onClick={() => updateConsent(record.profile.marketingConsent ? 'revoke' : 'grant')}
                className="mt-3 inline-flex rounded-full border border-[#D9E3EC] bg-white px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
              >
                {commsLoading
                  ? t.commsUpdating
                  : record.profile.marketingConsent
                    ? t.commsRevoke
                    : t.commsGrant}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#071F5E]">{t.projectInfo}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.organization}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.organization || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.city}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.profile}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">{t.interest}</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.interest || '—'}</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-[#F7FAFB] p-4 text-sm text-[#2F3336]/80">
              {record.profile.message || t.noMessage}
            </p>

            {answerEntries.length ? (
              <div className="mt-4 rounded-2xl bg-[#F7FAFB] p-4">
                <p className="text-sm font-semibold text-[#071F5E]">{t.formAnswers}</p>
                <div className="mt-3 grid gap-2">
                  {answerEntries.map(([key, value]) => (
                    <div key={key} className="text-sm text-[#2F3336]/85">
                      <span className="font-semibold text-[#071F5E]">{getAnswerLabel(key, displayLocale)}:</span>{' '}
                      {formatProjectAnswerValue(value, displayLocale)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
