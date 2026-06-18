'use client';

import { useEffect, useMemo, useState } from 'react';

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
    };
    locale?: string;
  };
};

type LocaleKey = 'es' | 'pt-BR' | 'en';

const inscriptionQuestionLabels: Record<LocaleKey, Record<string, string>> = {
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

const diagnosisQuestionLabels: Record<LocaleKey, Record<string, string>> = {
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

function getInscriptionAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = inscriptionQuestionLabels[getLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

function getDiagnosisAnswerLabel(key: string, locale?: string) {
  const normalized = key.toLowerCase();
  const labels = diagnosisQuestionLabels[getLocaleKey(locale)];
  return labels[normalized] || normalized.toUpperCase();
}

function toCsv(rows: Array<[string, string]>) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return ['Pergunta,Resposta', ...rows.map(([question, answer]) => `${escape(question)},${escape(answer)}`)].join('\n');
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

export function ProjectAdminDashboard() {
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [teamPassword, setTeamPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EnrollmentRecord | null>(null);
  const [selectedDiagnosisRecord, setSelectedDiagnosisRecord] = useState<EnrollmentRecord | null>(null);

  const getDiagnosisRows = (record: EnrollmentRecord) =>
    getOrderedAnswerEntries(record.profile.diagnosis?.answers).map(([key, value]) => [
      getDiagnosisAnswerLabel(key, record.profile.diagnosis?.locale || record.profile.locale),
      formatAnswerValue(value),
    ]) as Array<[string, string]>;

  const downloadDiagnosisCsv = (record: EnrollmentRecord) => {
    const rows = getDiagnosisRows(record);
    triggerDownload(toCsv(rows), `diagnostico-${record.id}.csv`, 'text/csv;charset=utf-8;');
  };

  const downloadDiagnosisWord = (record: EnrollmentRecord) => {
    const rows = getDiagnosisRows(record)
      .map(([question, answer]) => `<tr><td style="border:1px solid #ccc;padding:6px;"><strong>${question}</strong></td><td style="border:1px solid #ccc;padding:6px;">${answer}</td></tr>`)
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><h2>Diagnóstico - ${record.profile.name}</h2><table style="border-collapse:collapse;width:100%;">${rows}</table></body></html>`;
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
    <h2 style="margin: 0 0 4px;">Diagnóstico - ${record.profile.name || 'Participante'}</h2>
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
        body: JSON.stringify({ password: teamPassword }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Não foi possível autenticar a equipe.');
        setAuthenticated(false);
        return;
      }
      setRecords(payload.records || []);
      setAuthenticated(true);
    } catch {
      setError('Erro ao autenticar equipe.');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  const loadRecords = async () => {
    if (!authenticated) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/inscriptions');
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Não foi possível carregar as inscrições.');
        return;
      }
      setRecords(payload.records || []);
    } catch {
      setError('Erro ao carregar as inscrições.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadRecords();
    }
  }, [authenticated]);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter((record) => record.status === filter);
  }, [filter, records]);

  async function updateStatus(recordId: string, status: EnrollmentRecord['status']) {
    try {
      const response = await fetch(`/api/projeto/inscriptions/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: '' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Não foi possível atualizar a inscrição.');
        return;
      }
      await loadRecords();
    } catch {
      setError('Erro ao atualizar a inscrição.');
    }
  }

  if (!authenticated) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">Intranet da equipe</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">Acesso ao painel de inscrições</h1>
        </div>
        <div className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-[#071F5E]">Senha da equipe</label>
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
            Entrar na intranet
          </button>
        </div>
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">Painel da equipe</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">Inscrições do projeto</h1>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
        >
          <option value="all">Todas</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Rejeitadas</option>
        </select>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-[#2F3336]/70">Carregando inscrições...</p>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <article key={record.id} className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#071F5E]">{record.profile.name}</h2>
                    <span className="rounded-full bg-[#EEF7F7] px-3 py-1 text-xs font-semibold text-[#1D6359]">
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#2F3336]/75">{record.user.email}</p>
                  <p className="mt-1 text-sm text-[#2F3336]/75">
                    {record.profile.organization || 'Sem organização'} · {record.profile.city || 'Sem cidade'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    Ver formulário
                  </button>
                  <button
                    onClick={() => setSelectedDiagnosisRecord(record)}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                    disabled={!record.profile.diagnosis?.answers}
                  >
                    Ver diagnóstico
                  </button>
                  <button
                    onClick={() => updateStatus(record.id, 'approved')}
                    className="rounded-full bg-[#52ADAD] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => updateStatus(record.id, 'rejected')}
                    className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Perfil</p>
                  <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.role || 'Sem função informada'}</p>
                  <p className="text-sm text-[#2F3336]/80">{record.profile.interest || 'Sem interesse informado'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Contato</p>
                  <p className="mt-1 text-sm text-[#2F3336]/80">{record.profile.phone || 'Sem telefone'}</p>
                  <p className="text-sm text-[#2F3336]/80">{record.profile.locale || 'Locale não informado'}</p>
                </div>
              </div>
              <p className="mt-4 rounded-2xl bg-[#F7FAFB] p-4 text-sm text-[#2F3336]/80">
                {record.profile.message || 'Sem mensagem adicional.'}
              </p>
            </article>
          ))}
        </div>
      )}

      {selectedRecord ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071F5E]/45 p-4" onClick={() => setSelectedRecord(null)}>
          <div
            className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Formulário completo</p>
                <h3 className="mt-1 text-xl font-semibold text-[#071F5E]">{selectedRecord.profile.name}</h3>
                <p className="mt-1 text-sm text-[#2F3336]/75">{selectedRecord.user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F7FAFB] p-4">
              <div className="grid gap-2">
                {getOrderedAnswerEntries(selectedRecord.profile.answers).map(([key, value]) => (
                  <div key={key} className="text-sm text-[#2F3336]/85">
                    <span className="font-semibold text-[#071F5E]">{getInscriptionAnswerLabel(key, selectedRecord.profile.locale)}:</span>{' '}
                    {formatAnswerValue(value)}
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
                <p className="text-xs uppercase tracking-[0.2em] text-[#1D6359]">Diagnóstico completo</p>
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
                  Fechar
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
                    {formatAnswerValue(value)}
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
