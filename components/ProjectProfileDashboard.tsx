'use client';

import { useEffect, useState } from 'react';

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
  };
};

type LocaleKey = 'es' | 'pt-BR' | 'en';

const questionLabels: Record<LocaleKey, Record<string, string>> = {
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

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatAnswerValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || typeof value === 'undefined' || value === '') return '—';
  return String(value);
}

function getOrderedAnswerEntries(answers?: Record<string, unknown>) {
  if (!answers) return [] as Array<[string, unknown]>;
  return Object.entries(answers).sort(([a], [b]) => {
    const an = Number((a.match(/\d+/) || ['0'])[0]);
    const bn = Number((b.match(/\d+/) || ['0'])[0]);
    if (an === bn) return a.localeCompare(b);
    return an - bn;
  });
}

function getLocaleKey(locale?: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function getAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = questionLabels[getLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

function getDiagnosticCta(locale?: string) {
  const localeKey = getLocaleKey(locale);
  if (localeKey === 'pt-BR') return 'Ir para o diagnóstico';
  if (localeKey === 'en') return 'Go to diagnostic';
  return 'Ir al diagnóstico';
}

export function ProjectProfileDashboard({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [record, setRecord] = useState<EnrollmentRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const answerEntries = record ? getOrderedAnswerEntries(record.profile.answers) : [];

  const loadRecord = async (targetEmail: string) => {
    setLoading(true);
    setError('');
    setRecord(null);
    try {
      const response = await fetch('/api/projeto/auth/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Não foi possível carregar o perfil.');
        return;
      }
      const loadedRecord = payload.record || null;
      setRecord(loadedRecord);
      if (loadedRecord && typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'rc_candidate_session',
          JSON.stringify({
            id: loadedRecord.id,
            email: loadedRecord.user?.email || '',
            status: loadedRecord.status,
            locale: loadedRecord.profile?.locale || 'es',
            name: loadedRecord.profile?.name || '',
          })
        );
      }
    } catch {
      setError('Erro ao carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail && password) {
      loadRecord(initialEmail);
    }
  }, [initialEmail, password]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#071F5E] p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">Meu perfil</p>
        <h1 className="mt-2 text-3xl font-semibold">Acompanhe sua inscrição e próximos passos</h1>
      </div>

      {!record ? (
        <div className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="rounded-2xl border border-[#D9E3EC] px-4 py-3"
            />
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="rounded-2xl border border-[#D9E3EC] px-4 py-3"
            />
          </div>
          <div className="mt-3">
            <button
              onClick={() => loadRecord(email)}
              className="rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E]"
            >
              Entrar na intranet do candidato
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? <p className="text-sm text-[#2F3336]/70">Buscando informações...</p> : null}

      {record ? (
        <div className="space-y-4">
          <section className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#1D6359]">Status do usuário</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#071F5E]">{record.profile.name}</h2>
              </div>
              <span className="rounded-full bg-[#EEF7F7] px-3 py-1 text-sm font-semibold text-[#1D6359]">
                {record.status === 'approved' ? 'Aprovado' : record.status === 'rejected' ? 'Rejeitado' : 'Em análise'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">E-mail</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Criado em</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{formatDate(record.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Acesso</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.user.accessStatus}</p>
              </div>
            </div>

            {record.status === 'approved' ? (
              <div className="mt-4">
                <a
                  href={`/${getLocaleKey(record.profile.locale)}/projeto/diagnostico`}
                  className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
                >
                  {getDiagnosticCta(record.profile.locale)}
                </a>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#071F5E]">Informações do projeto</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Organização</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.organization || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Cidade</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Perfil</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Interesse</p>
                <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.interest || '—'}</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-[#F7FAFB] p-4 text-sm text-[#2F3336]/80">
              {record.profile.message || 'Sem mensagem adicional.'}
            </p>

            {answerEntries.length ? (
              <div className="mt-4 rounded-2xl bg-[#F7FAFB] p-4">
                <p className="text-sm font-semibold text-[#071F5E]">Respostas do formulário</p>
                <div className="mt-3 grid gap-2">
                  {answerEntries.map(([key, value]) => (
                    <div key={key} className="text-sm text-[#2F3336]/85">
                      <span className="font-semibold text-[#071F5E]">{getAnswerLabel(key, record.profile.locale)}:</span> {formatAnswerValue(value)}
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
