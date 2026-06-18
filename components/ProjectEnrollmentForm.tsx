'use client';

import { useState } from 'react';
import { ScrollText } from 'lucide-react';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? (locale as LocaleKey) : 'es';
}

const formCopy = {
  es: {
    q1: 'Nombre del emprendimiento, finca o empresa',
    q2: 'Nombre completo de la persona representante',
    q3: 'Teléfono / WhatsApp de contacto',
    q4: 'Correo electrónico',
    q5: 'Ubicación exacta (Cantón y Distrito dentro de la Región de Los Santos)',
    q6: '¿Su negocio está formalizado legalmente?',
    q6opts: ['Sí, totalmente formalizado.', 'En proceso.', 'No, operamos de forma informal por ahora.'],
    q7: '¿Cuál es el producto o actividad principal de su negocio?',
    q8: '¿Actualmente aprovecha o transforma algún residuo o subproducto de su cosecha?',
    q8opts: ['Sí.', 'No, pero me interesa aprender a hacerlo.', 'No me interesa por ahora.'],
    q9: '¿A quién le vende sus productos actualmente?',
    q9opts: ['Consumidor final (venta directa)', 'Intermediarios locales', 'Supermercados o tiendas nacionales', 'Exportación'],
    q10: '¿Alguna vez ha intentado vender sus productos en conjunto con otros productores locales?',
    q10opts: ['Sí, formo parte de un grupo, asociación o cooperativa.', 'Sí, de manera informal.', 'No, siempre vendo de forma individual.'],
    q11: 'En su día a día operativo, ¿cómo lleva el control de su negocio?',
    q11opts: [
      'Todo está en mi cabeza o en cuadernos.',
      'Uso herramientas básicas como Excel o WhatsApp.',
      'Utilizo algún software de contabilidad o gestión.',
      'Ya utilizo tecnología (sensores) de precisión.',
    ],
    q12: 'Del 1 al 5, ¿Qué tanto interés tiene en incorporar herramientas tecnológicas de bajo costo?',
    q12low: 'Nada de interés',
    q12high: 'Muchísimo interés',
    q13: 'Exportar al mercado de EE. UU. bajo un modelo colaborativo. ¿Cómo ve esta meta?',
    q13opts: [
      'Es mi meta principal y estoy dispuesto a hacer los cambios necesarios.',
      'Me interesa, pero creo que me falta mucha preparación.',
      'Prefiero enfocarme solo en el mercado local/nacional por ahora.',
    ],
    q13SelectPlaceholder: 'Seleccione una opción',
    q14: 'Disponibilidad para el programa intensivo (80 horas en 10 meses)',
    q14opts: ['Sí, confirmo mi disponibilidad y compromiso.', 'Tal vez, dependiendo de los horarios.', 'No creo tener el tiempo disponible.'],
    q15: '¿Por qué le gustaría ser una de las organizaciones seleccionadas?',
    introCta: 'Continuar',
    previous: 'Anterior',
    next: 'Siguiente',
    sectionGeneral: '1. Información General',
    sectionCommercial: '2. Perfil Productivo y Comercial',
    sectionTechnology: '3. Sinergia Tecnológica',
    sectionCommitment: '4. Nivel de Compromiso',
    labelPassword: 'Crea tu contraseña',
    labelPasswordConfirm: 'Confirma tu contraseña',
    passwordMismatch: 'Las contraseñas no coinciden.',
    submitting: 'Enviando...',
    submit: 'Registrar mi interés',
    successMsg: 'Inscripción enviada correctamente.',
    profileLink: 'Ver mi perfil',
    errorGeneric: 'Error inesperado al enviar la inscripción.',
  },
  'pt-BR': {
    q1: 'Nome do empreendimento, fazenda ou empresa',
    q2: 'Nome completo da pessoa representante',
    q3: 'Telefone / WhatsApp de contato',
    q4: 'Endereço de e-mail',
    q5: 'Localização exata (Cantão e Distrito na Região de Los Santos)',
    q6: 'Seu negócio está formalizado legalmente?',
    q6opts: ['Sim, totalmente formalizado.', 'Em processo.', 'Não, operamos de forma informal por enquanto.'],
    q7: 'Qual é o produto ou atividade principal do seu negócio?',
    q8: 'Atualmente aproveita ou transforma algum resíduo ou subproduto da sua colheita?',
    q8opts: ['Sim.', 'Não, mas tenho interesse em aprender.', 'Não me interessa por enquanto.'],
    q9: 'Para quem você vende seus produtos atualmente?',
    q9opts: ['Consumidor final (venda direta)', 'Intermediários locais', 'Supermercados ou lojas nacionais', 'Exportação'],
    q10: 'Você já tentou vender seus produtos em conjunto com outros produtores locais?',
    q10opts: ['Sim, faço parte de um grupo, associação ou cooperativa.', 'Sim, de forma informal.', 'Não, sempre vendo de forma individual.'],
    q11: 'No dia a dia operacional, como você controla seu negócio?',
    q11opts: [
      'Tudo está na minha cabeça ou em cadernos.',
      'Uso ferramentas básicas como Excel ou WhatsApp.',
      'Utilizo algum software de contabilidade ou gestão.',
      'Já utilizo sensores de clima, umidade ou tecnologia de precisão.',
    ],
    q12: 'De 1 a 5, qual é o seu interesse em incorporar ferramentas tecnológicas de baixo custo?',
    q12low: 'Nenhum interesse',
    q12high: 'Muitíssimo interesse',
    q13: 'Exportar para o mercado dos EUA sob um modelo colaborativo. Como você vê essa meta?',
    q13opts: [
      'É minha meta principal e estou disposto a fazer as mudanças necessárias.',
      'Me interessa, mas acho que preciso de muito mais preparação.',
      'Prefiro me concentrar apenas no mercado local/nacional por enquanto.',
    ],
    q13SelectPlaceholder: 'Selecione uma opção',
    q14: 'Disponibilidade para o programa intensivo (80 horas em 10 meses)',
    q14opts: ['Sim, confirmo minha disponibilidade e compromisso.', 'Talvez, dependendo dos horários.', 'Acho que não terei tempo disponível.'],
    q15: 'Por que gostaria de ser uma das organizações selecionadas?',
    introCta: 'Continuar',
    previous: 'Anterior',
    next: 'Seguinte',
    sectionGeneral: '1. Informação Geral',
    sectionCommercial: '2. Perfil Produtivo e Comercial',
    sectionTechnology: '3. Sinergia Tecnológica',
    sectionCommitment: '4. Nível de Compromisso',
    labelPassword: 'Crie sua senha',
    labelPasswordConfirm: 'Confirme sua senha',
    passwordMismatch: 'As senhas não coincidem.',
    submitting: 'Enviando...',
    submit: 'Registrar meu interesse',
    successMsg: 'Inscrição enviada com sucesso.',
    profileLink: 'Ver meu perfil',
    errorGeneric: 'Erro inesperado ao enviar a inscrição.',
  },
  en: {
    q1: 'Name of the venture, farm or company',
    q2: 'Full name of the representative',
    q3: 'Phone / WhatsApp contact',
    q4: 'Email address',
    q5: 'Exact location (Canton and District within the Los Santos Region)',
    q6: 'Is your business legally registered?',
    q6opts: ['Yes, fully registered.', 'In process.', 'No, we currently operate informally.'],
    q7: 'What is the main product or activity of your business?',
    q8: 'Do you currently use or transform any waste or by-product from your harvest?',
    q8opts: ['Yes.', 'No, but I am interested in learning.', 'Not interested at the moment.'],
    q9: 'Who do you currently sell your products to?',
    q9opts: ['End consumer (direct sales)', 'Local intermediaries', 'Supermarkets or national stores', 'Export'],
    q10: 'Have you ever tried to sell your products jointly with other local producers?',
    q10opts: ['Yes, I am part of a group, association or cooperative.', 'Yes, informally.', 'No, I always sell individually.'],
    q11: 'On a day-to-day basis, how do you manage your business operations?',
    q11opts: [
      'Everything is in my head or in notebooks.',
      'I use basic tools like Excel or WhatsApp.',
      'I use accounting or management software.',
      'I already use climate, humidity sensors or precision technology.',
    ],
    q12: 'From 1 to 5, how interested are you in incorporating low-cost technology tools?',
    q12low: 'No interest',
    q12high: 'Very interested',
    q13: 'Exporting to the US market under a collaborative model. How do you see this goal?',
    q13opts: [
      'It is my main goal and I am willing to make the necessary changes.',
      'I am interested, but I think I need much more preparation.',
      'I prefer to focus only on the local/national market for now.',
    ],
    q13SelectPlaceholder: 'Select an option',
    q14: 'Availability for the intensive program (80 hours over 10 months)',
    q14opts: ['Yes, I confirm my availability and commitment.', 'Maybe, depending on the schedule.', 'I do not think I will have the time available.'],
    q15: 'Why would you like to be one of the selected organizations?',
    introCta: 'Continue',
    previous: 'Previous',
    next: 'Next',
    sectionGeneral: '1. General Information',
    sectionCommercial: '2. Productive and Commercial Profile',
    sectionTechnology: '3. Technological Synergy',
    sectionCommitment: '4. Commitment Level',
    labelPassword: 'Create your password',
    labelPasswordConfirm: 'Confirm your password',
    passwordMismatch: 'Passwords do not match.',
    submitting: 'Sending...',
    submit: 'Register my interest',
    successMsg: 'Application submitted successfully.',
    profileLink: 'View my profile',
    errorGeneric: 'Unexpected error submitting the application.',
  },
} as const;

type FormData = {
  q1: string; q2: string; q3: string; q4: string; q5: string;
  q6: string; q7: string; q8: string; q9: string[];
  q10: string; q11: string; q12: number; q13: string; q14: string;
  q15: string; password: string; passwordConfirm: string;
};

const emptyForm = (): FormData => ({
  q1: '', q2: '', q3: '', q4: '', q5: '',
  q6: '', q7: '', q8: '', q9: [],
  q10: '', q11: '', q12: 0, q13: '', q14: '',
  q15: '', password: '', passwordConfirm: '',
});

function Radio({ name, value, checked, onChange, label }: {
  name: string; value: string; checked: boolean; onChange: (v: string) => void; label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D9E3EC] p-3 transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition pointer-events-none ${checked ? 'border-[#1D6359] bg-[#1D6359]' : 'border-[#B0BEC5]'}`}>
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className="text-sm leading-snug text-[#2F3336]">{label}</span>
    </label>
  );
}

function Checkbox({ value, checked, onChange, label }: {
  value: string; checked: boolean; onChange: (v: string, checked: boolean) => void; label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D9E3EC] p-3 transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition pointer-events-none ${checked ? 'border-[#1D6359] bg-[#1D6359]' : 'border-[#B0BEC5]'}`}>
        {checked && (
          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth="2">
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" value={value} checked={checked} onChange={(e) => onChange(value, e.target.checked)} className="sr-only" />
      <span className="text-sm leading-snug text-[#2F3336]">{label}</span>
    </label>
  );
}

type ProjectEnrollmentFormProps = {
  locale: string;
  eyebrow: string;
  introTitle: string;
  introText: string;
  introNote: string;
  nextStepsTitle: string;
  nextSteps: readonly string[];
};

export function ProjectEnrollmentForm({
  locale,
  eyebrow,
  introTitle,
  introText,
  introNote,
  nextStepsTitle,
  nextSteps,
}: ProjectEnrollmentFormProps) {
  const t = formCopy[getLocaleKey(locale)];
  const [form, setForm] = useState<FormData>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordId, setRecordId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const totalSteps = 8;
  const profileHref = submittedEmail ? `/${locale}/perfil?email=${encodeURIComponent(submittedEmail)}` : `/${locale}/perfil`;
  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const toggleCheck = (value: string, checked: boolean) =>
    setForm((prev) => ({
      ...prev,
      q9: checked ? [...prev.q9, value] : prev.q9.filter((v) => v !== value),
    }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError(t.passwordMismatch);
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const answers = {
        ...form,
        password: undefined,
        passwordConfirm: undefined,
      };
      const res = await fetch('/api/projeto/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.q2,
          email: form.q4,
          phone: form.q3,
          organization: form.q1,
          city: form.q5,
          role: '',
          interest: form.q7,
          message: form.q15,
          password: form.password,
          answers,
          locale,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        setError(payload.message || t.errorGeneric);
        return;
      }
      setSuccess(t.successMsg);
      setRecordId(payload.record?.id || '');
      setSubmittedEmail(form.q4);
      setForm(emptyForm());
      setCurrentStep(totalSteps - 1);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls = 'w-full rounded-2xl border border-[#D9E3EC] bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-[#52ADAD]';
  const legendCls = 'block text-sm font-medium text-[#071F5E] mb-3';
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const showFooterNavigation = !isFirstStep;
  const stepTitle =
    currentStep === 0
      ? introTitle
      : currentStep === 1 || currentStep === 2
        ? t.sectionGeneral
        : currentStep === 3 || currentStep === 4
          ? t.sectionCommercial
          : currentStep === 5
            ? t.sectionTechnology
            : currentStep === 6
              ? t.sectionCommitment
              : t.sectionCommitment;

  function goNext() {
    setCurrentStep((value) => Math.min(value + 1, totalSteps - 1));
  }

  function goPrevious() {
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-0">
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white px-2 py-1.5 sm:px-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{eyebrow}</p>
            <p className="text-xs text-[#2F3336]/60">{stepTitle}</p>
          </div>
          <div className="text-xs font-medium text-[#2F3336]/60">
            {currentStep + 1}/{totalSteps}
          </div>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[#1D6359] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={isFirstStep ? 'overflow-hidden rounded-[22px] bg-white' : 'min-h-0 flex-1 overflow-hidden rounded-[22px] bg-white'}>
        <div
          className={isFirstStep ? 'flex w-full items-start transition-transform duration-500 ease-out' : 'flex h-full w-full items-stretch transition-transform duration-500 ease-out'}
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          <div className={isFirstStep ? 'w-full self-start shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5' : 'h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5'}>
            <div className={isFirstStep ? 'flex flex-col rounded-[22px] bg-white p-2 sm:p-2.5' : 'flex h-full flex-col rounded-[22px] bg-white p-2.5 sm:p-3'}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
                <ScrollText size={22} />
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[#071F5E]">{introTitle}</h2>
              <p className="mt-1.5 text-sm leading-5 text-[#2F3336]/75">{introText}</p>
              <p className="mt-1 text-sm leading-5 text-[#2F3336]/75">{introNote}</p>
              <div className="mt-2 rounded-2xl bg-[#F6FAFA] p-2.5 text-sm leading-5 text-[#2F3336]/80">
                <p className="font-semibold text-[#071F5E]">{nextStepsTitle}</p>
                <ul className="mt-1.5 space-y-1">
                  {nextSteps.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E]"
                >
                  {t.introCta}
                </button>
              </div>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">1. {t.q1}</span>
                  <input required value={form.q1} onChange={(e) => set('q1', e.target.value)} className={`mt-1 ${inputCls}`} />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">2. {t.q2}</span>
                  <input required value={form.q2} onChange={(e) => set('q2', e.target.value)} className={`mt-1 ${inputCls}`} />
                </label>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">3. {t.q3}</span>
                  <input value={form.q3} onChange={(e) => set('q3', e.target.value)} className={`mt-1 ${inputCls}`} />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">4. {t.q4}</span>
                  <input type="email" required value={form.q4} onChange={(e) => set('q4', e.target.value)} className={`mt-1 ${inputCls}`} />
                </label>
              </div>
              <label className="block">
                <span className="block text-sm font-medium text-[#071F5E]">5. {t.q5}</span>
                <input value={form.q5} onChange={(e) => set('q5', e.target.value)} className={`mt-1 ${inputCls}`} />
              </label>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <fieldset>
                <legend className={legendCls}>6. {t.q6}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q6opts.map((opt) => (
                    <Radio key={opt} name="q6" value={opt} checked={form.q6 === opt} onChange={(v) => set('q6', v)} label={opt} />
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="block text-sm font-medium text-[#071F5E]">7. {t.q7}</span>
                <textarea rows={2} value={form.q7} onChange={(e) => set('q7', e.target.value)} className={`mt-1 ${inputCls} resize-none`} />
              </label>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <fieldset>
                <legend className={legendCls}>8. {t.q8}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q8opts.map((opt) => (
                    <Radio key={opt} name="q8" value={opt} checked={form.q8 === opt} onChange={(v) => set('q8', v)} label={opt} />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <fieldset>
                <legend className={legendCls}>9. {t.q9}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q9opts.map((opt) => (
                    <Checkbox key={opt} value={opt} checked={form.q9.includes(opt)} onChange={toggleCheck} label={opt} />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendCls}>10. {t.q10}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q10opts.map((opt) => (
                    <Radio key={opt} name="q10" value={opt} checked={form.q10 === opt} onChange={(v) => set('q10', v)} label={opt} />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <fieldset>
                <legend className={legendCls}>11. {t.q11}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q11opts.map((opt) => (
                    <Radio key={opt} name="q11" value={opt} checked={form.q11 === opt} onChange={(v) => set('q11', v)} label={opt} />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendCls}>12. {t.q12}</legend>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-[#2F3336]/60">{t.q12low}</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('q12', n)}
                      onMouseDown={(event) => event.preventDefault()}
                      className={`flex h-[21px] w-[21px] items-center justify-center rounded-full border-2 text-[9px] font-semibold transition ${
                        form.q12 === n ? 'border-[#1D6359] bg-[#1D6359] text-white' : 'border-[#D9E3EC] text-[#2F3336] hover:border-[#52ADAD]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-xs text-[#2F3336]/60">{t.q12high}</span>
                </div>
              </fieldset>
              <fieldset>
                <legend className={legendCls}>13. {t.q13}</legend>
                <select
                  required
                  value={form.q13}
                  onChange={(e) => set('q13', e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>
                    {t.q13SelectPlaceholder}
                  </option>
                  {t.q13opts.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <fieldset>
                <legend className={legendCls}>14. {t.q14}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.q14opts.map((opt) => (
                    <Radio key={opt} name="q14" value={opt} checked={form.q14 === opt} onChange={(v) => set('q14', v)} label={opt} />
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="block text-sm font-medium text-[#071F5E]">15. {t.q15}</span>
                <textarea rows={2} required value={form.q15} onChange={(e) => set('q15', e.target.value)} className={`mt-1 ${inputCls} resize-none`} />
              </label>
            </div>
          </div>

          <div className="h-full w-full shrink-0 px-0.25 py-0.25 sm:px-0.5 sm:py-0.5">
            <div className="flex h-full flex-col gap-2.5 rounded-[22px] bg-white p-2.5 sm:p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">{t.labelPassword}</span>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#1D6359] underline"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-[#071F5E]">{t.labelPasswordConfirm}</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.passwordConfirm}
                    onChange={(e) => set('passwordConfirm', e.target.value)}
                    className={`mt-1.5 ${inputCls}`}
                  />
                </label>
              </div>

              {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              {success ? (
                <div className="rounded-2xl bg-[#EEF7F7] p-4 text-sm text-[#1D6359]">
                  <p>{success}</p>
                  {recordId ? <p className="mt-1 text-xs opacity-70">ID: {recordId}</p> : null}
                  <a href={profileHref} className="mt-3 inline-flex text-sm font-semibold text-[#071F5E] underline">{t.profileLink}</a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showFooterNavigation ? (
        <div className="mt-2 flex flex-none items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrevious}
            className="inline-flex items-center justify-center rounded-full border border-[#D9E3EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#071F5E] transition"
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
              onClick={goNext}
              className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E]"
            >
              {t.next}
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}

