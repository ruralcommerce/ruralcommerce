'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProjectAgreementForm } from '@/components/ProjectAgreementForm';
import { ProjectDiagnosisForm } from '@/components/ProjectDiagnosisForm';
import { ProjectEnrollmentForm } from '@/components/ProjectEnrollmentForm';
import { writeCandidateSession } from '@/lib/project-candidate-session';
import { getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

type InviteView = {
  id: string;
  token: string;
  invitedEmail: string;
  registrationEmail: string | null;
  locale: string;
  status: 'sent' | 'in_progress' | 'completed' | 'revoked';
  progress: {
    currentStep: 'register' | 'agreement' | 'diagnosis' | 'done';
    registrationCompletedAt: string | null;
    agreementSignedAt: string | null;
    diagnosisCompletedAt: string | null;
  };
  enrollmentDraft: Record<string, unknown> | null;
  enrollmentDraftStep: number | null;
  inscriptionId: string | null;
};

type Phase = 'register' | 'agreement' | 'diagnosis' | 'done';

const copy: Record<
  ProjectLocaleKey,
  {
    loading: string;
    missing: string;
    revoked: string;
    title: string;
    text: string;
    stepRegister: string;
    stepAgreement: string;
    stepDiagnosis: string;
    stepDone: string;
    doneTitle: string;
    doneText: string;
    profileCta: string;
    resumeLoginHint: string;
  }
> = {
  es: {
    loading: 'Cargando invitación...',
    missing: 'No encontramos esta invitación. Revisa el enlace del correo.',
    revoked: 'Esta invitación ya no está disponible.',
    title: 'Invitación al proyecto',
    text: 'Completa registro, convenio y diagnóstico en un solo proceso. Solo quedarás integrado al proyecto cuando termines todas las etapas.',
    stepRegister: 'Registro',
    stepAgreement: 'Convenio',
    stepDiagnosis: 'Diagnóstico',
    stepDone: 'Listo',
    doneTitle: 'Ya formas parte del proyecto',
    doneText: 'Completaste el registro, firmaste el convenio y enviaste el diagnóstico. Tu lugar en Impulso MiPyMEs quedó activo.',
    profileCta: 'Ir a mi perfil',
    resumeLoginHint: 'Si ya creaste tu contraseña, inicia sesión abajo para continuar donde lo dejaste.',
  },
  'pt-BR': {
    loading: 'Carregando convite...',
    missing: 'Não encontramos este convite. Revise o link do e-mail.',
    revoked: 'Este convite não está mais disponível.',
    title: 'Convite para o projeto',
    text: 'Complete cadastro, convênio e diagnóstico em um único processo. Você só fica integrado ao projeto quando terminar todas as etapas.',
    stepRegister: 'Cadastro',
    stepAgreement: 'Convênio',
    stepDiagnosis: 'Diagnóstico',
    stepDone: 'Pronto',
    doneTitle: 'Você já faz parte do projeto',
    doneText: 'Você concluiu o cadastro, assinou o convênio e enviou o diagnóstico. Seu lugar no Impulso MiPyMEs está ativo.',
    profileCta: 'Ir ao meu perfil',
    resumeLoginHint: 'Se já criou a senha, entre abaixo para continuar de onde parou.',
  },
  en: {
    loading: 'Loading invitation...',
    missing: 'We could not find this invitation. Check the link in the email.',
    revoked: 'This invitation is no longer available.',
    title: 'Project invitation',
    text: 'Complete registration, agreement and diagnosis in one process. You join the project fully only when every step is done.',
    stepRegister: 'Registration',
    stepAgreement: 'Agreement',
    stepDiagnosis: 'Diagnosis',
    stepDone: 'Done',
    doneTitle: 'You are now part of the project',
    doneText: 'You completed registration, signed the agreement and submitted the diagnosis. Your place in Impulso MiPyMEs is active.',
    profileCta: 'Go to my profile',
    resumeLoginHint: 'If you already created your password, sign in below to continue where you left off.',
  },
};

function phaseFromInvite(invite: InviteView): Phase {
  if (invite.status === 'completed' || invite.progress.currentStep === 'done') return 'done';
  if (invite.progress.diagnosisCompletedAt) return 'done';
  if (invite.progress.agreementSignedAt || invite.progress.currentStep === 'diagnosis') return 'diagnosis';
  if (invite.progress.registrationCompletedAt || invite.progress.currentStep === 'agreement') return 'agreement';
  return 'register';
}

export function ProjectInviteOnboarding({
  locale,
  token,
}: {
  locale: string;
  token: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [invite, setInvite] = useState<InviteView | null>(null);
  const [phase, setPhase] = useState<Phase>('register');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEmail, setActiveEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/projeto/participant-invites/${encodeURIComponent(token)}`);
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          if (!cancelled) {
            setError(payload.message || t.missing);
            setInvite(null);
          }
          return;
        }
        const loaded = payload.invite as InviteView;
        if (!cancelled) {
          setInvite(loaded);
          setPhase(phaseFromInvite(loaded));
          setActiveEmail(loaded.registrationEmail || loaded.invitedEmail);
        }
      } catch {
        if (!cancelled) setError(t.missing);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, t.missing]);

  const steps = useMemo(
    () => [
      { id: 'register' as const, label: t.stepRegister },
      { id: 'agreement' as const, label: t.stepAgreement },
      { id: 'diagnosis' as const, label: t.stepDiagnosis },
      { id: 'done' as const, label: t.stepDone },
    ],
    [t]
  );

  const stepIndex = steps.findIndex((step) => step.id === phase);

  if (loading) {
    return <p className="rounded-2xl bg-white p-4 text-sm text-[#2F3336]/70 shadow-sm ring-1 ring-[#E6EBF1]">{t.loading}</p>;
  }

  if (error || !invite) {
    return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error || t.missing}</p>;
  }

  if (invite.status === 'revoked') {
    return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{t.revoked}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#E6EBF1] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">Impulso MiPyMEs</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#071F5E] sm:text-3xl">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#2F3336]/80">{t.text}</p>
        <p className="mt-3 text-xs text-[#2F3336]/55">
          {invite.invitedEmail}
          {invite.registrationEmail && invite.registrationEmail !== invite.invitedEmail
            ? ` · ${invite.registrationEmail}`
            : ''}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          {steps.map((step, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <div
                key={step.id}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  active
                    ? 'border-[#52ADAD] bg-[#F3FAFA] font-semibold text-[#071F5E]'
                    : done
                      ? 'border-[#D9E3EC] bg-[#F7FAFB] text-[#1D6359]'
                      : 'border-[#E6EBF1] text-[#2F3336]/55'
                }`}
              >
                <span className="text-[11px] uppercase tracking-[0.12em]">{index + 1}</span>
                <p className="mt-0.5">{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {phase === 'register' ? (
        <ProjectEnrollmentForm
          locale={localeKey}
          eyebrow={t.stepRegister}
          introTitle={t.title}
          introText={t.text}
          introNote={t.resumeLoginHint}
          nextStepsTitle=""
          nextSteps={[]}
          inviteToken={invite.token}
          initialEmail={invite.registrationEmail || invite.invitedEmail}
          initialDraft={(invite.enrollmentDraft as never) || null}
          initialStep={invite.enrollmentDraftStep}
          hideSuccessPanel
          onRegistered={({ id, email, password, name }) => {
            writeCandidateSession({
              id,
              email,
              password,
              status: 'onboarding',
              locale: localeKey,
              name,
              agreementSigned: false,
            });
            setActiveEmail(email);
            setPhase('agreement');
            setInvite((current) =>
              current
                ? {
                    ...current,
                    status: 'in_progress',
                    registrationEmail: email,
                    inscriptionId: id,
                    progress: {
                      ...current.progress,
                      currentStep: 'agreement',
                      registrationCompletedAt: new Date().toISOString(),
                    },
                  }
                : current
            );
          }}
        />
      ) : null}

      {phase === 'agreement' ? (
        <div className="space-y-3">
          <p className="text-sm text-[#2F3336]/70">{t.resumeLoginHint}</p>
          <ProjectAgreementForm
            locale={localeKey}
            initialEmail={activeEmail || invite.registrationEmail || invite.invitedEmail}
            embedded
            onSigned={() => {
              setPhase('diagnosis');
              setInvite((current) =>
                current
                  ? {
                      ...current,
                      progress: {
                        ...current.progress,
                        currentStep: 'diagnosis',
                        agreementSignedAt: new Date().toISOString(),
                      },
                    }
                  : current
              );
            }}
          />
        </div>
      ) : null}

      {phase === 'diagnosis' ? (
        <ProjectDiagnosisForm
          locale={localeKey}
          embedded
          onSubmitted={() => {
            setPhase('done');
            setInvite((current) =>
              current
                ? {
                    ...current,
                    status: 'completed',
                    progress: {
                      ...current.progress,
                      currentStep: 'done',
                      diagnosisCompletedAt: new Date().toISOString(),
                    },
                  }
                : current
            );
          }}
        />
      ) : null}

      {phase === 'done' ? (
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-[#E6EBF1]">
          <h2 className="text-xl font-semibold text-[#071F5E]">{t.doneTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.doneText}</p>
          <a
            href={`/${localeKey}/perfil${activeEmail ? `?email=${encodeURIComponent(activeEmail)}` : ''}`}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#52ADAD] px-6 py-2.5 text-sm font-semibold text-[#071F5E]"
          >
            {t.profileCta}
          </a>
        </div>
      ) : null}
    </div>
  );
}
