'use client';

import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Mic, Receipt } from 'lucide-react';
import {
  readCandidateSession,
  writeCandidateSession,
} from '@/lib/project-candidate-session';
import { getProjectLocaleKey, mapProjectApiMessage } from '@/lib/project-locale';
import {
  ProjectPortalHero,
  ProjectPortalPanel,
  ProjectPortalShell,
  ProjectPortalSteps,
} from '@/components/ProjectPortalLayout';
import type {
  InvestmentAmountKind,
  InvestmentAttributable,
  InvestmentCategory,
  InvestmentCurrency,
  InvestmentRecord,
} from '@/lib/project-investments';
import { hasInvestmentReceipt, hasInvestmentSignature, isPendingDocumentation } from '@/lib/project-investments';
import { ProjectInvestmentDownloadButton } from '@/components/ProjectInvestmentDownloadButton';
import { ProjectInvestmentStageMarker } from '@/components/ProjectInvestmentStageMarker';

const inputCls =
  'mt-2 w-full rounded-2xl border border-[#D9E3EC] bg-white px-4 py-3 text-base text-[#071F5E] outline-none focus:border-[#52ADAD]';

const categories: Array<{ id: InvestmentCategory; emoji: string }> = [
  { id: 'tool', emoji: '🛠️' },
  { id: 'premises', emoji: '🏠' },
  { id: 'digital', emoji: '📱' },
  { id: 'supplies', emoji: '📦' },
  { id: 'training', emoji: '🎓' },
  { id: 'other', emoji: '✨' },
];

const copy = {
  es: {
    eyebrow: 'Mis compras y mejoras',
    title: 'Cuéntanos lo que ya pusiste en tu negocio',
    description:
      'Si compraste algo o mejoraste tu negocio por el proyecto, regístralo aquí. Da igual si fue poco. Sí o sí necesitamos la factura o el recibo, y tu firma.',
    loginCta: 'Entrar',
    email: 'Correo',
    password: 'Contraseña',
    blockedTitle: 'Primero firma el convenio',
    blockedText: 'Cuando tu perfil esté aprobado y el convenio firmado, podrás registrar tus inversiones.',
    goConvenio: 'Ir al convenio',
    newCta: 'Registrar una compra o mejora',
    listTitle: 'Lo que ya empezaste',
    emptyList: 'Todavía no has registrado ninguna inversión. Empieza con una, aunque sea pequeña.',
    continueCta: 'Continuar esta ficha',
    savePending: 'Guardar pendiente',
    pendingDocs: 'Pendiente de envío de documentación',
    stepsTitle: 'Cómo se hace',
    steps: [
      'Elige qué compraste o mejoraste.',
      'Cuéntalo con palabras simples (puedes dictar).',
      'Di cuánto pagaste, si lo recuerdas.',
      'Sube la factura, recibo o comprobante de pago. Sin eso no se puede firmar.',
      'Firma con tu nombre completo.',
    ],
    welcomeTitle: 'Esto no es un banco',
    welcomeText:
      'Es un registro para el proyecto. El equipo revisará tus papeles. Si el comprobante se lee, tu inversión puede contar.',
    start: 'Empezar',
    back: 'Atrás',
    next: 'Continuar',
    catTitle: '¿Qué hiciste?',
    cats: {
      tool: 'Compré una herramienta o máquina',
      premises: 'Arreglé o mejoré el local',
      digital: 'Pagué internet, celular o un sistema',
      supplies: 'Compré insumos o mercadería',
      training: 'Pagué un curso, viaje o trámite',
      other: 'Otra cosa',
    },
    catHint: {
      tool: 'Ejemplo: una balanza, un refrigerador, un toldo.',
      premises: 'Ejemplo: pintura, un mostrador, un techo.',
      digital: 'Ejemplo: plan de internet, un celular, un programa.',
      supplies: 'Ejemplo: semilla, empaques, materia prima.',
      training: 'Ejemplo: un curso, un viaje a una feria, un permiso.',
      other: 'Cuéntanos con tus palabras en el siguiente paso.',
    },
    storyTitle: 'Cuéntalo con tus palabras',
    whatLabel: '¿Qué fue?',
    whatPh: 'Ejemplo: una balanza digital',
    whyLabel: '¿Para qué te sirve en el negocio?',
    whyPh: 'Ejemplo: para pesar y vender mejor',
    attrLabel: '¿Lo hiciste por lo que viste o aprendiste en el proyecto?',
    attrYes: 'Sí',
    attrPartial: 'Más o menos',
    attrNo: 'No',
    helpWrite: 'Ayúdame a escribir',
    dictate: 'Hablar',
    descLabel: 'Texto para firmar (puedes corregirlo)',
    amountTitle: '¿Cuánto te costó?',
    amountHint: 'Si no recuerdas el número, igual sube el papel. El técnico lo confirma.',
    currencyCrc: 'Colones',
    currencyUsd: 'Dólares',
    amountExact: 'Sé el monto exacto',
    amountApprox: 'Es un aproximado',
    amountUnknown: 'No lo sé, está en el comprobante',
    amountLabel: 'Monto',
    receiptsTitle: 'Sube el papel donde se vea cuánto pagaste',
    receiptsMust: 'Sin factura, recibo o comprobante de pago no puedes firmar.',
    receiptsOk: 'Sí cuenta: factura, recibo, nota de venta, SINPE, captura del banco, ticket de caja.',
    receiptsNo: 'No cuenta: solo foto del producto, cotización, o un WhatsApp sin monto.',
    rulesTitle: 'Así debe verse la foto',
    rules: [
      'Se ve el papel entero, no un recorte.',
      'Se lee el monto, la fecha y quién cobró.',
      'Hay luz de frente; no borroso.',
      'Si son varias hojas, sube una foto por hoja.',
    ],
    addReceipt: 'Tomar o subir comprobante',
    addObject: 'Foto de lo que compraste (opcional)',
    uploading: 'Subiendo...',
    receiptCount: (n: number) => (n === 1 ? '1 comprobante listo' : `${n} comprobantes listos`),
    needReceipt: 'Falta el comprobante. Sin ese papel no es formal.',
    signTitle: 'Revisa y firma',
    summaryWhat: 'Qué hiciste',
    summaryAmount: 'Cuánto',
    paidByMe: 'Esto lo pagué yo o mi negocio.',
    documentsReal: 'Los comprobantes son reales y corresponden a esta compra.',
    projectRelated: 'Lo hice como parte de lo que el proyecto me impulsó a hacer.',
    authorizeUse: 'Autorizo que el equipo use esto para el informe del proyecto.',
    fullName: 'Nombre completo (firma)',
    fullNamePh: 'Escribe tu nombre como en tu cédula',
    signCta: 'Firmar y enviar',
    signing: 'Firmando...',
    successTitle: 'Quedó firmado',
    successText: 'El equipo técnico va a revisar tus papeles. Te avisaremos. Puedes registrar otra compra cuando quieras.',
    another: 'Registrar otra',
    goProfile: 'Volver a mi perfil',
    download: 'Descargar constancia PDF',
    errorGeneric: 'No fue posible guardar. Intenta de nuevo.',
    status: {
      draft: 'Pendiente de documentación',
      submitted: 'En revisión',
      accepted_18a: 'Aceptada para el indicador',
      rejected: 'No aceptada',
      not_attributable: 'No cuenta para el indicador',
    },
  },
  'pt-BR': {
    eyebrow: 'Minhas compras e melhorias',
    title: 'Conte o que já colocou no seu negócio',
    description:
      'Se comprou algo ou melhorou o negócio por causa do projeto, registre aqui. Não importa se foi pouco. Precisamos da fatura ou recibo, e da sua assinatura.',
    loginCta: 'Entrar',
    email: 'E-mail',
    password: 'Senha',
    blockedTitle: 'Assine o convênio primeiro',
    blockedText: 'Com o perfil aprovado e o convênio assinado, você poderá registrar os investimentos.',
    goConvenio: 'Ir ao convênio',
    newCta: 'Registrar uma compra ou melhoria',
    listTitle: 'O que você já começou',
    emptyList: 'Você ainda não registrou nenhum investimento. Comece com um, mesmo pequeno.',
    continueCta: 'Continuar esta ficha',
    savePending: 'Salvar pendente',
    pendingDocs: 'Pendente de envio da documentação',
    stepsTitle: 'Como fazer',
    steps: [
      'Escolha o que comprou ou melhorou.',
      'Conte com palavras simples (pode ditar).',
      'Diga quanto pagou, se lembrar.',
      'Envie a fatura, recibo ou comprovante. Sem isso não dá para assinar.',
      'Assine com seu nome completo.',
    ],
    welcomeTitle: 'Isto não é um banco',
    welcomeText:
      'É um registro para o projeto. A equipe vai olhar os papéis. Se o comprovante se lê, o investimento pode contar.',
    start: 'Começar',
    back: 'Voltar',
    next: 'Continuar',
    catTitle: 'O que você fez?',
    cats: {
      tool: 'Comprei uma ferramenta ou máquina',
      premises: 'Consertei ou melhorei o local',
      digital: 'Paguei internet, celular ou um sistema',
      supplies: 'Comprei insumos ou mercadoria',
      training: 'Paguei um curso, viagem ou trâmite',
      other: 'Outra coisa',
    },
    catHint: {
      tool: 'Exemplo: uma balança, um refrigerador, um toldo.',
      premises: 'Exemplo: pintura, um balcão, um telhado.',
      digital: 'Exemplo: plano de internet, um celular, um programa.',
      supplies: 'Exemplo: semente, embalagens, matéria-prima.',
      training: 'Exemplo: um curso, uma feira, uma licença.',
      other: 'Conte com suas palavras no próximo passo.',
    },
    storyTitle: 'Conte com suas palavras',
    whatLabel: 'O que foi?',
    whatPh: 'Exemplo: uma balança digital',
    whyLabel: 'Para que serve no negócio?',
    whyPh: 'Exemplo: para pesar e vender melhor',
    attrLabel: 'Você fez isso pelo que viu ou aprendeu no projeto?',
    attrYes: 'Sim',
    attrPartial: 'Mais ou menos',
    attrNo: 'Não',
    helpWrite: 'Me ajude a escrever',
    dictate: 'Falar',
    descLabel: 'Texto para assinar (pode corrigir)',
    amountTitle: 'Quanto custou?',
    amountHint: 'Se não lembrar o número, mesmo assim envie o papel. O técnico confirma.',
    currencyCrc: 'Colones',
    currencyUsd: 'Dólares',
    amountExact: 'Sei o valor exato',
    amountApprox: 'É aproximado',
    amountUnknown: 'Não sei, está no comprovante',
    amountLabel: 'Valor',
    receiptsTitle: 'Envie o papel onde se vê quanto pagou',
    receiptsMust: 'Sem fatura, recibo ou comprovante não dá para assinar.',
    receiptsOk: 'Vale: fatura, recibo, nota, SINPE, captura do banco, ticket.',
    receiptsNo: 'Não vale: só foto do produto, orçamento, ou WhatsApp sem valor.',
    rulesTitle: 'Assim deve aparecer a foto',
    rules: [
      'O papel inteiro, sem recorte.',
      'Dá para ler valor, data e quem cobrou.',
      'Luz de frente; nítido.',
      'Se forem várias folhas, uma foto por folha.',
    ],
    addReceipt: 'Tirar ou enviar comprovante',
    addObject: 'Foto do que comprou (opcional)',
    uploading: 'Enviando...',
    receiptCount: (n: number) => (n === 1 ? '1 comprovante pronto' : `${n} comprovantes prontos`),
    needReceipt: 'Falta o comprovante. Sem esse papel não é formal.',
    signTitle: 'Revise e assine',
    summaryWhat: 'O que fez',
    summaryAmount: 'Quanto',
    paidByMe: 'Eu ou meu negócio pagamos isto.',
    documentsReal: 'Os comprovantes são reais e desta compra.',
    projectRelated: 'Fiz isto pelo que o projeto me impulsionou a fazer.',
    authorizeUse: 'Autorizo a equipe a usar isto no relatório do projeto.',
    fullName: 'Nome completo (assinatura)',
    fullNamePh: 'Escreva seu nome como no documento',
    signCta: 'Assinar e enviar',
    signing: 'Assinando...',
    successTitle: 'Ficou assinado',
    successText: 'A equipe técnica vai revisar os papéis. Você será avisado. Pode registrar outra compra quando quiser.',
    another: 'Registrar outra',
    goProfile: 'Voltar ao meu perfil',
    download: 'Baixar comprovante PDF',
    errorGeneric: 'Não foi possível salvar. Tente de novo.',
    status: {
      draft: 'Pendente de documentação',
      submitted: 'Em revisão',
      accepted_18a: 'Aceita para o indicador',
      rejected: 'Não aceita',
      not_attributable: 'Não conta para o indicador',
    },
  },
  en: {
    eyebrow: 'My purchases and improvements',
    title: 'Tell us what you already put into your business',
    description:
      'If you bought something or improved your business because of the project, record it here. Size does not matter. We do need the invoice or receipt, and your signature.',
    loginCta: 'Sign in',
    email: 'Email',
    password: 'Password',
    blockedTitle: 'Sign the agreement first',
    blockedText: 'Once your profile is approved and the agreement is signed, you can record investments.',
    goConvenio: 'Go to agreement',
    newCta: 'Record a purchase or improvement',
    listTitle: 'What you already started',
    emptyList: 'You have not recorded an investment yet. Start with one, even a small one.',
    continueCta: 'Continue this record',
    savePending: 'Save as pending',
    pendingDocs: 'Pending documentation',
    stepsTitle: 'How it works',
    steps: [
      'Choose what you bought or improved.',
      'Tell it in simple words (you can dictate).',
      'Say how much you paid, if you remember.',
      'Upload the invoice, receipt or payment proof. You cannot sign without it.',
      'Sign with your full name.',
    ],
    welcomeTitle: 'This is not a bank',
    welcomeText:
      'It is a project record. The team will review your papers. If the receipt is readable, your investment can count.',
    start: 'Start',
    back: 'Back',
    next: 'Continue',
    catTitle: 'What did you do?',
    cats: {
      tool: 'I bought a tool or machine',
      premises: 'I repaired or improved the premises',
      digital: 'I paid for internet, a phone or software',
      supplies: 'I bought supplies or merchandise',
      training: 'I paid for a course, trip or permit',
      other: 'Something else',
    },
    catHint: {
      tool: 'Example: a scale, a fridge, a tarp.',
      premises: 'Example: paint, a counter, a roof.',
      digital: 'Example: an internet plan, a phone, an app.',
      supplies: 'Example: seed, packaging, raw material.',
      training: 'Example: a course, a fair, a permit.',
      other: 'Tell us in your own words on the next step.',
    },
    storyTitle: 'Tell it in your own words',
    whatLabel: 'What was it?',
    whatPh: 'Example: a digital scale',
    whyLabel: 'How does it help the business?',
    whyPh: 'Example: to weigh and sell better',
    attrLabel: 'Did you do this because of what you saw or learned in the project?',
    attrYes: 'Yes',
    attrPartial: 'Somewhat',
    attrNo: 'No',
    helpWrite: 'Help me write',
    dictate: 'Speak',
    descLabel: 'Text to sign (you can edit it)',
    amountTitle: 'How much did it cost?',
    amountHint: 'If you do not remember the number, still upload the paper. The technician will confirm.',
    currencyCrc: 'Colones',
    currencyUsd: 'US dollars',
    amountExact: 'I know the exact amount',
    amountApprox: 'It is an estimate',
    amountUnknown: 'I do not know — it is on the receipt',
    amountLabel: 'Amount',
    receiptsTitle: 'Upload the paper that shows what you paid',
    receiptsMust: 'Without an invoice, receipt or payment proof you cannot sign.',
    receiptsOk: 'Counts: invoice, receipt, sales note, transfer proof, bank screenshot, till ticket.',
    receiptsNo: 'Does not count: only a photo of the item, a quote, or a chat with no amount.',
    rulesTitle: 'How the photo should look',
    rules: [
      'The whole paper, not a crop.',
      'Amount, date and who charged are readable.',
      'Front lighting; not blurry.',
      'If there are several pages, one photo per page.',
    ],
    addReceipt: 'Take or upload receipt',
    addObject: 'Photo of what you bought (optional)',
    uploading: 'Uploading...',
    receiptCount: (n: number) => (n === 1 ? '1 receipt ready' : `${n} receipts ready`),
    needReceipt: 'The receipt is missing. Without that paper it is not formal.',
    signTitle: 'Review and sign',
    summaryWhat: 'What you did',
    summaryAmount: 'Amount',
    paidByMe: 'I or my business paid for this.',
    documentsReal: 'The receipts are real and belong to this purchase.',
    projectRelated: 'I did this because the project pushed me to do it.',
    authorizeUse: 'I authorize the team to use this for the project report.',
    fullName: 'Full name (signature)',
    fullNamePh: 'Type your name as on your ID',
    signCta: 'Sign and submit',
    signing: 'Signing...',
    successTitle: 'It is signed',
    successText: 'The technical team will review your papers. We will notify you. You can record another purchase anytime.',
    another: 'Record another',
    goProfile: 'Back to my profile',
    download: 'Download PDF record',
    errorGeneric: 'Could not save. Try again.',
    status: {
      draft: 'Pending documentation',
      submitted: 'Under review',
      accepted_18a: 'Accepted for the indicator',
      rejected: 'Not accepted',
      not_attributable: 'Does not count for the indicator',
    },
  },
} as const;

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
        selected ? 'border-[#1D6359] bg-[#F3FAFA] text-[#071F5E]' : 'border-[#D9E3EC] bg-white text-[#2F3336]'
      }`}
    >
      {children}
    </button>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D9E3EC] p-3 transition hover:border-[#52ADAD]">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
          checked ? 'border-[#1D6359] bg-[#1D6359]' : 'border-[#B0BEC5]'
        }`}
      >
        {checked ? (
          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth="2">
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm leading-snug text-[#2F3336]">{label}</span>
    </label>
  );
}

export function ProjectInvestmentForm({ locale }: { locale: string }) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eligible, setEligible] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [organization, setOrganization] = useState('');
  const [records, setRecords] = useState<InvestmentRecord[]>([]);
  const [current, setCurrent] = useState<InvestmentRecord | null>(null);
  const [step, setStep] = useState<-1 | 0 | 1 | 2 | 3 | 4 | 5 | 6>(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [paidByMe, setPaidByMe] = useState(false);
  const [documentsReal, setDocumentsReal] = useState(false);
  const [projectRelated, setProjectRelated] = useState(false);
  const [authorizeUse, setAuthorizeUse] = useState(false);

  const signedRecords = records;
  const receiptCount = current?.files.filter((file) => file.kind === 'receipt').length || 0;

  function resumeStep(record: InvestmentRecord): 0 | 1 | 2 | 3 | 4 | 5 {
    if (!record.category) return 1;
    if (!(record.what || '').trim() || !record.attributable) return 2;
    if (!record.amountKind) return 3;
    if (!hasInvestmentReceipt(record)) return 4;
    if (!hasInvestmentSignature(record)) return 5;
    return 5;
  }

  async function loadMine(nextEmail = email, nextPassword = password) {
    setError('');
    const response = await fetch('/api/projeto/investments/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nextEmail, password: nextPassword }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(mapProjectApiMessage(payload.message, localeKey, t.errorGeneric));
    }
    const profile = payload.participant?.profile || {};
    setEligible(payload.eligible === true);
    setParticipantName(profile.name || '');
    setOrganization(profile.organization || '');
    setRecords(payload.records || []);
    writeCandidateSession({
      id: payload.participant?.id,
      email: nextEmail,
      password: nextPassword,
      status: payload.participant?.status,
      name: profile.name,
      agreementSigned: profile.agreement?.signed === true,
      locale: localeKey,
    });
    if (!fullName && profile.name) setFullName(profile.name);
    return payload.records as InvestmentRecord[];
  }

  useEffect(() => {
    const session = readCandidateSession();
    if (session?.email) setEmail(session.email);
    if (session?.password) setPassword(session.password);
    if (!session?.email || !session?.password) {
      setLoading(false);
      return;
    }
    loadMine(session.email, session.password)
      .catch((err) => setError(err instanceof Error ? err.message : t.errorGeneric))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveDraft(patch: Record<string, unknown>, submit = false, idOverride?: string | null) {
    setSaving(true);
    setError('');
    try {
      const investmentId = idOverride === null ? undefined : idOverride ?? current?.id;
      const response = await fetch('/api/projeto/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          locale: localeKey,
          id: investmentId,
          ...patch,
          submit,
          fullName,
          paidByMe,
          documentsReal,
          projectRelated,
          authorizeUse,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(mapProjectApiMessage(payload.message, localeKey, t.errorGeneric));
      }
      setCurrent(payload.record);
      const next = await loadMine();
      return next.find((item) => item.id === payload.record.id) || payload.record;
    } finally {
      setSaving(false);
    }
  }

  async function startNew() {
    const draft = records.find((item) => item.status === 'draft');
    if (draft) {
      setCurrent(draft);
      setStep(resumeStep(draft));
      return;
    }
    const record = await saveDraft({}, false, null);
    setCurrent(record);
    setStep(0);
  }

  function continueRecord(record: InvestmentRecord) {
    setCurrent(record);
    if (isPendingDocumentation(record) || record.status === 'draft') {
      setStep(resumeStep(record));
      return;
    }
    setStep(6);
  }

  async function uploadFile(file: File, kind: 'receipt' | 'object') {
    if (!current) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.set('email', email);
      body.set('password', password);
      body.set('investmentId', current.id);
      body.set('kind', kind);
      body.set('file', file);
      const response = await fetch('/api/projeto/investments/upload', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(mapProjectApiMessage(payload.message, localeKey, t.errorGeneric));
      }
      setCurrent(payload.record);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setUploading(false);
    }
  }

  function helpWrite() {
    const what = current?.what?.trim();
    const why = current?.why?.trim();
    const sentence =
      localeKey === 'pt-BR'
        ? [what ? `Comprei ${what}` : '', why ? `para ${why}` : ''].filter(Boolean).join(' ') + '.'
        : localeKey === 'en'
          ? [what ? `I bought ${what}` : '', why ? `to ${why}` : ''].filter(Boolean).join(' ') + '.'
          : [what ? `Compré ${what}` : '', why ? `para ${why}` : ''].filter(Boolean).join(' ') + '.';
    void saveDraft({ description: sentence.trim() });
  }

  function dictate() {
    type SpeechCtor = new () => {
      lang: string;
      start: () => void;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    };
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Speech = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Speech) {
      setError(
        localeKey === 'es'
          ? 'Tu navegador no permite dictar. Escribe en el recuadro.'
          : localeKey === 'pt-BR'
            ? 'Seu navegador não permite ditar. Escreva no campo.'
            : 'Your browser cannot dictate. Type in the box.'
      );
      return;
    }
    const recognition = new Speech();
    recognition.lang = localeKey === 'pt-BR' ? 'pt-BR' : localeKey === 'en' ? 'en-US' : 'es-CR';
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results || [])
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (spoken) void saveDraft({ what: `${current?.what || ''} ${spoken}`.trim() });
    };
    recognition.start();
  }

  const progress = step < 0 ? 0 : Math.min(100, Math.round((step / 5) * 100));

  if (loading) {
    return <p className="p-6 text-sm text-[#2F3336]/70">...</p>;
  }

  if (!password || !email) {
    return (
      <div className="space-y-5">
        <ProjectPortalHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <ProjectPortalPanel>
          <label className="block text-sm font-medium text-[#071F5E]">
            {t.email}
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-medium text-[#071F5E]">
            {t.password}
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="button"
            className="mt-4 rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E]"
            onClick={() => {
              setLoading(true);
              loadMine()
                .catch((err) => setError(err instanceof Error ? err.message : t.errorGeneric))
                .finally(() => setLoading(false));
            }}
          >
            {t.loginCta}
          </button>
        </ProjectPortalPanel>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="space-y-5">
        <ProjectPortalHero eyebrow={t.eyebrow} title={t.blockedTitle} description={t.blockedText} />
        <a href={`/${localeKey}/projeto/convenio`} className="inline-flex rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E]">
          {t.goConvenio}
        </a>
      </div>
    );
  }

  if (step >= 0 && current) {
    return (
      <div className="space-y-5">
        <ProjectPortalHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <div className="h-2 overflow-hidden rounded-full bg-[#E6EBF1]">
          <div className="h-full bg-[#52ADAD]" style={{ width: `${progress}%` }} />
        </div>
        <ProjectPortalPanel>
          <ProjectInvestmentStageMarker locale={localeKey} record={current} />
        </ProjectPortalPanel>
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {step === 0 ? (
          <ProjectPortalPanel title={t.welcomeTitle} subtitle={t.welcomeText}>
            <button type="button" className="rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E]" onClick={() => setStep(1)}>
              {t.start}
            </button>
          </ProjectPortalPanel>
        ) : null}

        {step === 1 ? (
          <ProjectPortalPanel title={t.catTitle}>
            <div className="grid gap-3">
              {categories.map((item) => (
                <Choice
                  key={item.id}
                  selected={current.category === item.id}
                  onClick={() => void saveDraft({ category: item.id })}
                >
                  <span className="mr-2">{item.emoji}</span>
                  {t.cats[item.id]}
                  <span className="mt-1 block text-xs font-normal text-[#2F3336]/70">{t.catHint[item.id]}</span>
                </Choice>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setStep(0)}>
                {t.back}
              </button>
              <button
                type="button"
                disabled={!current.category}
                className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
                onClick={() => setStep(2)}
              >
                {t.next}
              </button>
            </div>
          </ProjectPortalPanel>
        ) : null}

        {step === 2 ? (
          <ProjectPortalPanel title={t.storyTitle}>
            <label className="block text-sm font-medium text-[#071F5E]">
              {t.whatLabel}
              <input className={inputCls} value={current.what || ''} placeholder={t.whatPh} onChange={(e) => setCurrent({ ...current, what: e.target.value })} onBlur={() => void saveDraft({ what: current.what })} />
            </label>
            <label className="mt-3 block text-sm font-medium text-[#071F5E]">
              {t.whyLabel}
              <input className={inputCls} value={current.why || ''} placeholder={t.whyPh} onChange={(e) => setCurrent({ ...current, why: e.target.value })} onBlur={() => void saveDraft({ why: current.why })} />
            </label>
            <p className="mt-4 text-sm font-medium text-[#071F5E]">{t.attrLabel}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Choice selected={current.attributable === 'yes'} onClick={() => void saveDraft({ attributable: 'yes' as InvestmentAttributable })}>
                {t.attrYes}
              </Choice>
              <Choice selected={current.attributable === 'partial'} onClick={() => void saveDraft({ attributable: 'partial' })}>
                {t.attrPartial}
              </Choice>
              <Choice selected={current.attributable === 'no'} onClick={() => void saveDraft({ attributable: 'no' })}>
                {t.attrNo}
              </Choice>
            </div>
            <label className="mt-4 block text-sm font-medium text-[#071F5E]">
              {t.descLabel}
              <textarea
                className={`${inputCls} min-h-[96px]`}
                value={current.description || ''}
                onChange={(e) => setCurrent({ ...current, description: e.target.value })}
                onBlur={() => void saveDraft({ description: current.description })}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm" onClick={helpWrite}>
                {t.helpWrite}
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm" onClick={dictate}>
                <Mic size={16} /> {t.dictate}
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setStep(1)}>
                {t.back}
              </button>
              <button
                type="button"
                disabled={!current.what || !current.attributable}
                className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
                onClick={() => void saveDraft({ what: current.what, why: current.why, description: current.description }).then(() => setStep(3))}
              >
                {t.next}
              </button>
            </div>
          </ProjectPortalPanel>
        ) : null}

        {step === 3 ? (
          <ProjectPortalPanel title={t.amountTitle} subtitle={t.amountHint}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Choice selected={(current.currency || 'CRC') === 'CRC'} onClick={() => void saveDraft({ currency: 'CRC' as InvestmentCurrency })}>
                {t.currencyCrc}
              </Choice>
              <Choice selected={current.currency === 'USD'} onClick={() => void saveDraft({ currency: 'USD' })}>
                {t.currencyUsd}
              </Choice>
            </div>
            <div className="mt-3 grid gap-2">
              <Choice selected={current.amountKind === 'exact'} onClick={() => void saveDraft({ amountKind: 'exact' as InvestmentAmountKind })}>
                {t.amountExact}
              </Choice>
              <Choice selected={current.amountKind === 'approximate'} onClick={() => void saveDraft({ amountKind: 'approximate' })}>
                {t.amountApprox}
              </Choice>
              <Choice selected={current.amountKind === 'unknown'} onClick={() => void saveDraft({ amountKind: 'unknown' })}>
                {t.amountUnknown}
              </Choice>
            </div>
            {current.amountKind && current.amountKind !== 'unknown' ? (
              <label className="mt-4 block text-sm font-medium text-[#071F5E]">
                {t.amountLabel}
                <input
                  inputMode="decimal"
                  className={inputCls}
                  value={current.amountOriginal ?? ''}
                  onChange={(e) => setCurrent({ ...current, amountOriginal: Number(e.target.value) || 0 })}
                  onBlur={() => void saveDraft({ amountOriginal: current.amountOriginal, amountKind: current.amountKind, currency: current.currency || 'CRC' })}
                />
              </label>
            ) : null}
            <div className="mt-4 flex gap-3">
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setStep(2)}>
                {t.back}
              </button>
              <button
                type="button"
                disabled={!current.amountKind}
                className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
                onClick={() => setStep(4)}
              >
                {t.next}
              </button>
            </div>
          </ProjectPortalPanel>
        ) : null}

        {step === 4 ? (
          <ProjectPortalPanel title={t.receiptsTitle} subtitle={t.receiptsMust}>
            <p className="rounded-2xl bg-[#F3FAFA] p-3 text-sm text-[#1D6359]">{t.receiptsOk}</p>
            <p className="mt-2 rounded-2xl bg-[#FFF6F0] p-3 text-sm text-[#8A4B12]">{t.receiptsNo}</p>
            <p className="mt-4 text-sm font-semibold text-[#071F5E]">{t.rulesTitle}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#2F3336]/85">
              {t.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
            <div className="mt-4 space-y-2">
              {current.files.map((file) => (
                <p key={file.id} className="flex items-center gap-2 rounded-xl bg-[#F7FAFB] px-3 py-2 text-sm">
                  {file.kind === 'receipt' ? <Receipt size={16} /> : <Camera size={16} />}
                  {file.originalName}
                </p>
              ))}
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1D6359]">{t.receiptCount(receiptCount)}</p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E]">
              <Camera size={16} />
              {uploading ? t.uploading : t.addReceipt}
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file, 'receipt');
                  e.target.value = '';
                }}
              />
            </label>
            <label className="ml-2 mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-3 text-sm">
              {t.addObject}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file, 'object');
                  e.target.value = '';
                }}
              />
            </label>
            {receiptCount < 1 ? <p className="mt-3 text-sm text-red-700">{t.needReceipt}</p> : null}
            <div className="mt-4 flex gap-3">
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setStep(3)}>
                {t.back}
              </button>
              <button
                type="button"
                disabled={receiptCount < 1}
                className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
                onClick={() => setStep(5)}
              >
                {t.next}
              </button>
            </div>
          </ProjectPortalPanel>
        ) : null}

        {step === 5 ? (
          <ProjectPortalPanel title={t.signTitle}>
            <p className="text-sm">
              <strong>{t.summaryWhat}:</strong> {current.description || current.what}
            </p>
            <p className="mt-1 text-sm">
              <strong>{t.summaryAmount}:</strong>{' '}
              {current.amountKind === 'unknown' ? '—' : `${current.currency || 'CRC'} ${current.amountOriginal ?? '—'}`}
            </p>
            <p className="mt-1 text-sm">{t.receiptCount(receiptCount)}</p>
            <div className="mt-4 space-y-2">
              <CheckRow checked={paidByMe} onChange={setPaidByMe} label={t.paidByMe} />
              <CheckRow checked={documentsReal} onChange={setDocumentsReal} label={t.documentsReal} />
              <CheckRow checked={projectRelated} onChange={setProjectRelated} label={t.projectRelated} />
              <CheckRow checked={authorizeUse} onChange={setAuthorizeUse} label={t.authorizeUse} />
            </div>
            <label className="mt-4 block text-sm font-medium text-[#071F5E]">
              {t.fullName}
              <input className={inputCls} value={fullName} placeholder={t.fullNamePh} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setStep(4)}>
                {t.back}
              </button>
              <button
                type="button"
                className="rounded-full border px-5 py-2 text-sm"
                onClick={async () => {
                  await saveDraft({ what: current.what, why: current.why, description: current.description });
                  setCurrent(null);
                  setStep(-1);
                }}
              >
                {t.savePending}
              </button>
              <button
                type="button"
                disabled={saving || !fullName.trim() || !paidByMe || !documentsReal || !projectRelated || !authorizeUse || receiptCount < 1}
                className="rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
                onClick={async () => {
                  try {
                    if (receiptCount < 1) {
                      setError(t.needReceipt);
                      return;
                    }
                    await saveDraft({}, true);
                    setStep(6);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : t.errorGeneric);
                  }
                }}
              >
                {saving ? t.signing : t.signCta}
              </button>
            </div>
            {receiptCount < 1 ? <p className="mt-3 text-sm text-red-700">{t.needReceipt}</p> : null}
          </ProjectPortalPanel>
        ) : null}

        {step === 6 ? (
          <ProjectPortalPanel title={t.successTitle} subtitle={t.successText} tone="accent">
            <div className="flex items-center gap-2 text-[#1D6359]">
              <CheckCircle2 /> {t.successTitle}
            </div>
            {current.signature ? (
              <div className="mt-4">
                <ProjectInvestmentDownloadButton
                  locale={localeKey}
                  investment={current}
                  participantName={fullName || participantName}
                  email={email}
                  organization={organization}
                />
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E]"
                onClick={() => {
                  setCurrent(null);
                  setStep(-1);
                  setPaidByMe(false);
                  setDocumentsReal(false);
                  setProjectRelated(false);
                  setAuthorizeUse(false);
                }}
              >
                {t.another}
              </button>
              <a href={`/${localeKey}/perfil`} className="rounded-full border px-5 py-2 text-sm font-semibold text-[#071F5E]">
                {t.goProfile}
              </a>
            </div>
          </ProjectPortalPanel>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProjectPortalHero eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <ProjectPortalShell
        sidebar={<ProjectPortalSteps title={t.stepsTitle} steps={[...t.steps]} />}
      >
        <ProjectPortalPanel>
          <button type="button" className="rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E]" onClick={() => void startNew()}>
            {t.newCta}
          </button>
        </ProjectPortalPanel>
        <ProjectPortalPanel title={t.listTitle} subtitle={signedRecords.length ? undefined : t.emptyList}>
          <div className="space-y-3">
            {signedRecords.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#E6EBF1] p-4">
                <p className="font-medium text-[#071F5E]">{item.what || item.description || item.id}</p>
                <p className="mt-1 text-sm text-[#2F3336]/75">{t.status[item.status]}</p>
                <div className="mt-3">
                  <ProjectInvestmentStageMarker locale={localeKey} record={item} compact />
                </div>
                {isPendingDocumentation(item) ? (
                  <button
                    type="button"
                    className="mt-3 rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E]"
                    onClick={() => continueRecord(item)}
                  >
                    {t.continueCta}
                  </button>
                ) : item.signature ? (
                  <div className="mt-3">
                    <ProjectInvestmentDownloadButton
                      locale={localeKey}
                      investment={item}
                      participantName={item.signature.fullName}
                      email={email}
                      organization={organization}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ProjectPortalPanel>
      </ProjectPortalShell>
    </div>
  );
}
