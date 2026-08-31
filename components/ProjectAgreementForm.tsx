'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import { mapProjectApiMessage } from '@/lib/project-locale';
import { getProjectAgreementCopy } from '@/lib/project-agreement-copy';
import { PROJECT_NAME } from '@/lib/project-brand';
import {
  patchCandidateSession,
  readCandidateSession,
  writeCandidateSession,
} from '@/lib/project-candidate-session';
import { ProjectAgreementDownloadButton } from '@/components/ProjectAgreementDownloadButton';
import {
  ProjectPortalHero,
  ProjectPortalPanel,
  ProjectPortalShell,
  ProjectPortalSteps,
} from '@/components/ProjectPortalLayout';
import {
  buildLegacyAgreementDocumentId,
  buildLegacyVerificationCode,
} from '@/lib/project-agreement-document';
import { formatProjectDate } from '@/lib/project-locale';

type LocaleKey = 'es' | 'pt-BR' | 'en';

type CandidateRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedAt?: string;
  user: { email: string };
  profile: {
    name?: string;
    organization?: string;
    locale?: string;
    agreement?: { signed?: boolean; signedAt?: string; fullName?: string; locale?: string; documentId?: string; verificationCode?: string; ip?: string };
  };
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const uiCopy: Record<
  LocaleKey,
  {
    pageTitle: string;
    pageIntro: string;
    stepsTitle: string;
    steps: string[];
    eyebrow: string;
    loginTitle: string;
    loginText: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    loginCta: string;
    sessionHint: string;
    blockedTitle: string;
    blockedText: string;
    goToProfile: string;
    signedTitle: string;
    signedText: string;
    signedByLabel: string;
    signedAtLabel: string;
    goToDiagnosis: string;
    signSectionTitle: string;
    signSectionText: string;
    passwordConfirmLabel: string;
    passwordConfirmHint: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    signCta: string;
    signing: string;
    requiredError: string;
    passwordRequiredError: string;
    genericError: string;
  }
> = {
  es: {
    pageTitle: 'Convenio de participación del proyecto',
    pageIntro: `Este es el paso oficial para integrarte a ${PROJECT_NAME}. Aquí están las reglas del programa y la firma electrónica de tu compromiso.`,
    stepsTitle: 'Cómo firmar (4 pasos)',
    steps: [
      'Inicia sesión con el correo y la contraseña de tu inscripción.',
      'Lee el convenio completo (reglas de participación).',
      'Marca las 4 casillas de aceptación.',
      'Escribe tu nombre completo y pulsa «Firmar convenio».',
    ],
    eyebrow: 'Paso obligatorio · Proyecto Impulso MiPyMEs',
    loginTitle: 'Accede para firmar el convenio',
    loginText:
      'Usa el mismo correo y contraseña que creaste al inscribirte. Si ya entraste en «Mi perfil», usa esos mismos datos.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña de la inscripción',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loginCta: 'Continuar al convenio',
    sessionHint: 'Sesión activa como',
    blockedTitle: 'Perfil aún no aprobado',
    blockedText: 'Podrás firmar el convenio cuando el equipo apruebe tu perfil. Te avisaremos por correo.',
    goToProfile: 'Ver mi perfil',
    signedTitle: 'Convenio firmado',
    signedText: 'Ya firmaste el convenio de participación. Puedes descargarlo cuando quieras y continuar con el diagnóstico.',
    signedByLabel: 'Firmado por',
    signedAtLabel: 'Fecha de firma',
    goToDiagnosis: 'Ir al diagnóstico',
    signSectionTitle: 'Firma electrónica',
    signSectionText: 'Al firmar confirmas que leíste el convenio y aceptas las condiciones del proyecto.',
    passwordConfirmLabel: 'Confirma tu contraseña para firmar',
    passwordConfirmHint: 'Por seguridad, vuelve a escribir la contraseña de tu inscripción antes de firmar.',
    fullNameLabel: 'Nombre completo (firma)',
    fullNamePlaceholder: 'Escribe tu nombre completo',
    signCta: 'Firmar convenio',
    signing: 'Firmando...',
    requiredError: 'Debes aceptar las cuatro casillas y escribir tu nombre completo.',
    passwordRequiredError: 'Escribe tu contraseña de inscripción para confirmar la firma.',
    genericError: 'No se pudo firmar el convenio. Intenta nuevamente.',
  },
  'pt-BR': {
    pageTitle: 'Convênio de participação do projeto',
    pageIntro: `Esta é a etapa oficial para integrar o ${PROJECT_NAME}. Aqui estão as regras do programa e a assinatura eletrônica do seu compromisso.`,
    stepsTitle: 'Como assinar (4 passos)',
    steps: [
      'Entre com o e-mail e a senha da sua inscrição.',
      'Leia o convênio completo (regras de participação).',
      'Marque as 4 caixas de aceite.',
      'Escreva seu nome completo e clique em «Assinar convênio».',
    ],
    eyebrow: 'Etapa obrigatória · Projeto Impulso MiPyMEs',
    loginTitle: 'Acesse para assinar o convênio',
    loginText:
      'Use o mesmo e-mail e senha criados na inscrição. Se já entrou em «Meu perfil», use os mesmos dados.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha da inscrição',
    forgotPassword: 'Esqueceu sua senha?',
    loginCta: 'Continuar para o convênio',
    sessionHint: 'Sessão ativa como',
    blockedTitle: 'Perfil ainda não aprovado',
    blockedText: 'Você poderá assinar o convênio quando a equipe aprovar seu perfil. Avisaremos por e-mail.',
    goToProfile: 'Ver meu perfil',
    signedTitle: 'Convênio assinado',
    signedText: 'Você já assinou o convênio de participação. Pode baixá-lo quando quiser e continuar com o diagnóstico.',
    signedByLabel: 'Assinado por',
    signedAtLabel: 'Data da assinatura',
    goToDiagnosis: 'Ir para o diagnóstico',
    signSectionTitle: 'Assinatura eletrônica',
    signSectionText: 'Ao assinar, você confirma que leu o convênio e aceita as condições do projeto.',
    passwordConfirmLabel: 'Confirme sua senha para assinar',
    passwordConfirmHint: 'Por segurança, digite novamente a senha da inscrição antes de assinar.',
    fullNameLabel: 'Nome completo (assinatura)',
    fullNamePlaceholder: 'Escreva seu nome completo',
    signCta: 'Assinar convênio',
    signing: 'Assinando...',
    requiredError: 'Você precisa aceitar as quatro caixas e escrever seu nome completo.',
    passwordRequiredError: 'Digite sua senha de inscrição para confirmar a assinatura.',
    genericError: 'Não foi possível assinar o convênio. Tente novamente.',
  },
  en: {
    pageTitle: 'Project participation agreement',
    pageIntro: `This is the official step to join ${PROJECT_NAME}. Here you will find the program rules and sign your commitment electronically.`,
    stepsTitle: 'How to sign (4 steps)',
    steps: [
      'Log in with the email and password from your application.',
      'Read the full agreement (participation rules).',
      'Check all 4 acceptance boxes.',
      'Type your full name and click «Sign agreement».',
    ],
    eyebrow: 'Required step · Impulso MiPyMEs Project',
    loginTitle: 'Sign in to sign the agreement',
    loginText:
      'Use the same email and password you created when applying. If you already logged into «My profile», use the same credentials.',
    emailLabel: 'Email',
    passwordLabel: 'Application password',
    forgotPassword: 'Forgot your password?',
    loginCta: 'Continue to agreement',
    sessionHint: 'Signed in as',
    blockedTitle: 'Profile not approved yet',
    blockedText: 'You will be able to sign the agreement once the team approves your profile. We will notify you by email.',
    goToProfile: 'View my profile',
    signedTitle: 'Agreement signed',
    signedText: 'You have already signed the participation agreement. You can download it anytime and continue with the diagnosis.',
    signedByLabel: 'Signed by',
    signedAtLabel: 'Signed on',
    goToDiagnosis: 'Go to the diagnosis',
    signSectionTitle: 'Electronic signature',
    signSectionText: 'By signing, you confirm that you read the agreement and accept the project conditions.',
    passwordConfirmLabel: 'Confirm your password to sign',
    passwordConfirmHint: 'For security, re-enter your application password before signing.',
    fullNameLabel: 'Full name (signature)',
    fullNamePlaceholder: 'Type your full name',
    signCta: 'Sign agreement',
    signing: 'Signing...',
    requiredError: 'You must accept all four boxes and type your full name.',
    passwordRequiredError: 'Enter your application password to confirm the signature.',
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
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState('');

  const [imageRights, setImageRights] = useState(false);
  const [networkMembership, setNetworkMembership] = useState(false);
  const [commitment, setCommitment] = useState(false);
  const [communications, setCommunications] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const isApproved = record?.status === 'approved';
  const alreadySigned = record?.profile?.agreement?.signed === true;

  const persistSession = useCallback(
    (loaded: CandidateRecord, passwordValue?: string) => {
      writeCandidateSession({
        id: loaded.id,
        email: loaded.user.email,
        status: loaded.status,
        locale: loaded.profile.locale || localeKey,
        name: loaded.profile.name || '',
        agreementSigned: loaded.profile.agreement?.signed === true,
        password: passwordValue || password || readCandidateSession()?.password,
      });
    },
    [localeKey, password]
  );

  const fetchRecord = useCallback(
    async (targetEmail: string, targetPassword: string, silent = false) => {
      if (!silent) setIsCheckingLogin(true);
      setError('');
      try {
        const response = await fetch('/api/projeto/auth/candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, password: targetPassword }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          if (!silent) setError(mapProjectApiMessage(payload.message, localeKey, t.genericError));
          return null;
        }
        const loaded = payload.record as CandidateRecord;
        setRecord(loaded);
        setEmail(loaded.user.email);
        setPassword(targetPassword);
        if (loaded.profile?.name && !fullName) setFullName(loaded.profile.name);
        if (loaded.status === 'approved') persistSession(loaded, targetPassword);
        return loaded;
      } catch {
        if (!silent) setError(t.genericError);
        return null;
      } finally {
        if (!silent) setIsCheckingLogin(false);
      }
    },
    [fullName, localeKey, persistSession, t.genericError]
  );

  useEffect(() => {
    const session = readCandidateSession();
    if (session?.email) setEmail(session.email);
    if (session?.password) setPassword(session.password);
    if (session?.name) setFullName(session.name);

    if (session?.email && session?.password) {
      void fetchRecord(session.email, session.password, true).finally(() => setIsBootstrapping(false));
    } else {
      setIsBootstrapping(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    await fetchRecord(email, password);
  };

  const resolvePassword = () => password || readCandidateSession()?.password || '';

  const handleSign = async () => {
    const signPassword = resolvePassword();
    if (!imageRights || !networkMembership || !commitment || !communications || !fullName.trim()) {
      setError(t.requiredError);
      return;
    }
    if (!signPassword) {
      setError(t.passwordRequiredError);
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
          password: signPassword,
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
      persistSession(loaded, signPassword);
      patchCandidateSession({ agreementSigned: true, password: signPassword });
    } catch {
      setError(t.genericError);
    } finally {
      setIsSigning(false);
    }
  };

  const inputCls = 'mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm';

  const agreementDownloadInput = (loaded: CandidateRecord) => {
    const agreement = loaded.profile.agreement;
    const signedName = agreement?.fullName || loaded.profile.name || loaded.user.email;
    return {
      candidateId: loaded.id,
      fullName: signedName,
      email: loaded.user.email,
      organization: loaded.profile.organization,
      signedAt: agreement?.signedAt || loaded.updatedAt,
      locale: agreement?.locale || loaded.profile.locale || localeKey,
      documentId:
        agreement?.documentId || buildLegacyAgreementDocumentId(loaded.id, agreement?.signedAt),
      verificationCode:
        agreement?.verificationCode ||
        buildLegacyVerificationCode(loaded.id, agreement?.signedAt, agreement?.fullName),
      ipAddress: agreement?.ip,
    };
  };

  const pageShell = (content: React.ReactNode) => (
    <div className="space-y-5">
      <ProjectPortalHero eyebrow={t.eyebrow} title={t.pageTitle} description={t.pageIntro} />
      <ProjectPortalShell sidebar={<ProjectPortalSteps title={t.stepsTitle} steps={t.steps} />}>
        {content}
      </ProjectPortalShell>
    </div>
  );

  if (isBootstrapping) {
    return pageShell(
      <ProjectPortalPanel>
        <p className="text-sm text-[#2F3336]/70">...</p>
      </ProjectPortalPanel>
    );
  }

  if (!record) {
    return pageShell(
      <ProjectPortalPanel title={t.loginTitle} subtitle={t.loginText}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.emailLabel}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.passwordLabel}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
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
      </ProjectPortalPanel>
    );
  }

  if (!isApproved) {
    return pageShell(
      <ProjectPortalPanel title={t.blockedTitle} subtitle={t.blockedText}>
          <a
            href={`/${locale}/perfil`}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-[#D9E3EC] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
          >
            {t.goToProfile}
          </a>
      </ProjectPortalPanel>
    );
  }

  if (alreadySigned) {
    const agreement = record.profile.agreement;
    const signedName = agreement?.fullName || record.profile.name || record.user.email;
    const signedAt = agreement?.signedAt || '';

    return pageShell(
      <ProjectPortalPanel title={t.signedTitle} subtitle={t.signedText} tone="accent">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
            <CheckCircle2 size={22} />
          </div>
          {signedName ? (
            <p className="mt-3 text-sm text-[#2F3336]/85">
              <span className="font-semibold text-[#071F5E]">{t.signedByLabel}:</span> {signedName}
            </p>
          ) : null}
          {signedAt ? (
            <p className="mt-1 text-sm text-[#2F3336]/85">
              <span className="font-semibold text-[#071F5E]">{t.signedAtLabel}:</span>{' '}
              {formatProjectDate(signedAt, localeKey)}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <ProjectAgreementDownloadButton locale={localeKey} input={agreementDownloadInput(record)} />
            <a
              href={`/${locale}/projeto/diagnostico`}
              className="inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
            >
              {t.goToDiagnosis}
            </a>
          </div>
      </ProjectPortalPanel>
    );
  }

  const showPasswordField = !resolvePassword();

  return pageShell(
    <ProjectPortalPanel>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F3F3] text-[#1D6359]">
          <FileSignature size={22} />
        </div>
        <p className="mt-2 text-xs text-[#1D6359]">
          {t.sessionHint} <strong>{record.user.email}</strong>
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#071F5E]">{agreement.title}</h2>
        <p className="mt-1 text-sm text-[#2F3336]/75">{agreement.intro}</p>

        <div className="mt-4 max-h-[min(60vh,28rem)] space-y-3 overflow-y-auto rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-4 text-sm leading-6 text-[#2F3336]/85 sm:max-h-[50vh]">
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

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[#071F5E]">{t.signSectionTitle}</h3>
          <p className="mt-1 text-sm text-[#2F3336]/75">{t.signSectionText}</p>
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

        {showPasswordField ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#071F5E]">{t.passwordConfirmLabel}</span>
            <p className="mt-0.5 text-xs text-[#2F3336]/65">{t.passwordConfirmHint}</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
        ) : null}

        {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="button"
          onClick={handleSign}
          disabled={isSigning}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#52ADAD] px-6 py-3 text-sm font-semibold text-[#071F5E] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSigning ? t.signing : t.signCta}
        </button>
    </ProjectPortalPanel>
  );
}
