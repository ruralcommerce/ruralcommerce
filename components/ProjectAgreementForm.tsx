'use client';

import { useEffect, useState } from 'react';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import { mapProjectApiMessage } from '@/lib/project-locale';
import { getProjectAgreementCopy } from '@/lib/project-agreement-copy';

type LocaleKey = 'es' | 'pt-BR' | 'en';

type CandidateRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: { email: string };
  profile: {
    name?: string;
    locale?: string;
    agreement?: { signed?: boolean; signedAt?: string; fullName?: string };
  };
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function sessionKey() {
  return 'rc_candidate_session';
}

const uiCopy: Record<
  LocaleKey,
  {
    eyebrow: string;
    loginTitle: string;
    loginText: string;
    emailLabel: string;
    passwordLabel: string;
    loginCta: string;
    blockedTitle: string;
    blockedText: string;
    goToProfile: string;
    signedTitle: string;
    signedText: string;
    goToDiagnosis: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    signCta: string;
    signing: string;
    requiredError: string;
    genericError: string;
  }
> = {
  es: {
    eyebrow: 'Convenio de participación',
    loginTitle: 'Acceso al convenio',
    loginText: 'Para firmar el convenio debes iniciar sesión con el correo y la contraseña de tu inscripción.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    loginCta: 'Entrar',
    blockedTitle: 'Perfil aún no aprobado',
    blockedText: 'Podrás firmar el convenio cuando el equipo apruebe tu perfil. Te avisaremos por correo.',
    goToProfile: 'Ver mi perfil',
    signedTitle: 'Convenio firmado',
    signedText: 'Ya firmaste el convenio de participación. Ahora puedes completar el diagnóstico.',
    goToDiagnosis: 'Ir al diagnóstico',
    fullNameLabel: 'Nombre completo (firma)',
    fullNamePlaceholder: 'Escribe tu nombre completo',
    signCta: 'Firmar convenio',
    signing: 'Firmando...',
    requiredError: 'Debes aceptar los cuatro términos y escribir tu nombre completo.',
    genericError: 'No se pudo firmar el convenio. Intenta nuevamente.',
  },
  'pt-BR': {
    eyebrow: 'Convênio de participação',
    loginTitle: 'Acesso ao convênio',
    loginText: 'Para assinar o convênio, faça login com o e-mail e a senha da sua inscrição.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    loginCta: 'Entrar',
    blockedTitle: 'Perfil ainda não aprovado',
    blockedText: 'Você poderá assinar o convênio quando a equipe aprovar seu perfil. Avisaremos por e-mail.',
    goToProfile: 'Ver meu perfil',
    signedTitle: 'Convênio assinado',
    signedText: 'Você já assinou o convênio de participação. Agora pode preencher o diagnóstico.',
    goToDiagnosis: 'Ir para o diagnóstico',
    fullNameLabel: 'Nome completo (assinatura)',
    fullNamePlaceholder: 'Escreva seu nome completo',
    signCta: 'Assinar convênio',
    signing: 'Assinando...',
    requiredError: 'Você precisa aceitar os quatro termos e escrever seu nome completo.',
    genericError: 'Não foi possível assinar o convênio. Tente novamente.',
  },
  en: {
    eyebrow: 'Participation agreement',
    loginTitle: 'Agreement access',
    loginText: 'To sign the agreement, log in with the email and password from your application.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginCta: 'Enter',
    blockedTitle: 'Profile not approved yet',
    blockedText: 'You will be able to sign the agreement once the team approves your profile. We will notify you by email.',
    goToProfile: 'View my profile',
    signedTitle: 'Agreement signed',
    signedText: 'You have already signed the participation agreement. You can now complete the diagnosis.',
    goToDiagnosis: 'Go to the diagnosis',
    fullNameLabel: 'Full name (signature)',
    fullNamePlaceholder: 'Type your full name',
    signCta: 'Sign agreement',
    signing: 'Signing...',
    requiredError: 'You must accept all four terms and type your full name.',
    genericError: 'The agreement could not be signed. Please try again.',
  },
};

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
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D9E3EC] p-3 transition hover:border-[#52ADAD] hover:bg-[#F7FDFB]">
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition pointer-events-none ${
          checked ? 'border-[#1D6359] bg-[#1D6359]' : 'border-[#B0BEC5]'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth="2">
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm leading-snug text-[#2F3336]">{label}</span>
    </label>
  );
}

export function ProjectAgreementForm({ locale, initialEmail }: { locale: string; initialEmail?: string }) {
  const localeKey = getLocaleKey(locale);
  const t = uiCopy[localeKey];
  const agreement = getProjectAgreementCopy(localeKey);

  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [record, setRecord] = useState<CandidateRecord | null>(null);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [error, setError] = useState('');

  const [imageRights, setImageRights] = useState(false);
  const [networkMembership, setNetworkMembership] = useState(false);
  const [commitment, setCommitment] = useState(false);
  const [communications, setCommunications] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const isApproved = record?.status === 'approved';
  const alreadySigned = record?.profile?.agreement?.signed === true;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(sessionKey());
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        email?: string;
        status?: string;
        id?: string;
        locale?: string;
        name?: string;
        agreementSigned?: boolean;
      };
      if (!parsed?.email || parsed.status !== 'approved') return;
      setEmail(parsed.email);
      setRecord({
        id: parsed.id || `session_${parsed.email}`,
        status: 'approved',
        user: { email: parsed.email },
        profile: {
          name: parsed.name || '',
          locale: parsed.locale || localeKey,
          agreement: { signed: parsed.agreementSigned === true },
        },
      });
      if (parsed.name) setFullName(parsed.name);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSession(loaded: CandidateRecord) {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(
      sessionKey(),
      JSON.stringify({
        id: loaded.id,
        email: loaded.user.email,
        status: loaded.status,
        locale: loaded.profile.locale || localeKey,
        name: loaded.profile.name || '',
        agreementSigned: loaded.profile.agreement?.signed === true,
      })
    );
  }

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
      const loaded = payload.record as CandidateRecord;
      setRecord(loaded);
      if (loaded.profile?.name && !fullName) setFullName(loaded.profile.name);
      if (loaded.status === 'approved') persistSession(loaded);
    } catch {
      setError(t.genericError);
    } finally {
      setIsCheckingLogin(false);
    }
  };

  const handleSign = async () => {
    if (!imageRights || !networkMembership || !commitment || !communications || !fullName.trim()) {
      setError(t.requiredError);
      return;
    }
    setIsSigning(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: record?.user.email || email,
          password,
          fullName: fullName.trim(),
          imageRights,
          networkMembership,
          commitment,
          communications,
          locale: localeKey,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.genericError));
        return;
      }
      const loaded = payload.record as CandidateRecord;
      setRecord(loaded);
      persistSession(loaded);
    } catch {
      setError(t.genericError);
    } finally {
      setIsSigning(false);
    }
  };

  const cardCls = 'rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#E6EBF1] sm:p-5';
  const inputCls = 'mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm';

  if (!record) {
    return (
      <div className={cardCls}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.loginTitle}</h2>
        <p className="mt-1 text-sm text-[#2F3336]/75">{t.loginText}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#071F5E]">{t.emailLabel}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#071F5E]">{t.passwordLabel}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
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
        {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className={cardCls}>
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

  if (alreadySigned) {
    return (
      <div className={cardCls}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
          <CheckCircle2 size={22} />
        </div>
        <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">{t.signedTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.signedText}</p>
        <a
          href={`/${locale}/projeto/diagnostico`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
        >
          {t.goToDiagnosis}
        </a>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
        <FileSignature size={22} />
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold text-[#071F5E]">{agreement.title}</h2>
      <p className="mt-1 text-sm text-[#2F3336]/75">{agreement.intro}</p>

      <div className="mt-4 max-h-[58vh] space-y-3 overflow-y-auto rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-4 text-sm leading-6 text-[#2F3336]/85">
        <p className="font-semibold text-[#071F5E]">{agreement.agreementHeading}</p>
        {agreement.agreementParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
        <p className="pt-1 font-semibold text-[#071F5E]">{agreement.networkHeading}</p>
        <p>{agreement.networkText}</p>
        <p className="pt-1 font-semibold text-[#071F5E]">{agreement.benefitsHeading}</p>
        <p>{agreement.benefitsText}</p>
        <p className="pt-1 font-semibold text-[#071F5E]">{agreement.imageRightsHeading}</p>
        <p>{agreement.imageRightsText}</p>
        <p className="pt-1 font-semibold text-[#071F5E]">{agreement.commitmentHeading}</p>
        <p>{agreement.commitmentText}</p>
        <p className="pt-1 font-semibold text-[#071F5E]">{agreement.communicationsHeading}</p>
        <p>{agreement.communicationsText}</p>
      </div>

      <div className="mt-4 space-y-2">
        <CheckRow checked={networkMembership} onChange={setNetworkMembership} label={agreement.networkCheckbox} />
        <CheckRow checked={imageRights} onChange={setImageRights} label={agreement.imageRightsCheckbox} />
        <CheckRow checked={commitment} onChange={setCommitment} label={agreement.commitmentCheckbox} />
        <CheckRow checked={communications} onChange={setCommunications} label={agreement.communicationsCheckbox} />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-[#071F5E]">{t.fullNameLabel}</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t.fullNamePlaceholder}
          className={inputCls}
        />
      </label>

      {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="button"
        onClick={handleSign}
        disabled={isSigning}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigning ? t.signing : t.signCta}
      </button>
    </div>
  );
}
