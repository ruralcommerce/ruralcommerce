'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProjectDiagnosisForm } from '@/components/ProjectDiagnosisForm';
import { readTeamSession } from '@/lib/project-team-session-client';
import { getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

type AssistRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: { email: string };
  profile: {
    name?: string;
    agreement?: { signed?: boolean };
    diagnosis?: {
      answers?: Record<string, string>;
      draft?: {
        answers?: Record<string, string>;
        currentStep?: number;
        updatedAt?: string;
      };
      submittedBy?: {
        type?: string;
        teamMemberName?: string;
      };
    };
  };
};

const copy: Record<
  ProjectLocaleKey,
  {
    loginRequired: string;
    goIntranet: string;
    loadError: string;
    loadGeneric: string;
    loading: string;
    notFound: string;
    backPanel: string;
    notApproved: string;
    assistEyebrow: string;
    technician: string;
    lastTeamUpdate: string;
  }
> = {
  es: {
    loginRequired: 'Inicia sesión en la intranet del equipo para continuar.',
    goIntranet: 'Ir a la intranet del equipo',
    loadError: 'No fue posible cargar el registro.',
    loadGeneric: 'Error al cargar el registro.',
    loading: 'Cargando asistencia técnica...',
    notFound: 'Participante no encontrado.',
    backPanel: 'Volver al panel',
    notApproved: 'Este registro aún no está aprobado para el diagnóstico.',
    assistEyebrow: 'Asistencia técnica',
    technician: 'Técnico',
    lastTeamUpdate: 'Última actualización del equipo',
  },
  'pt-BR': {
    loginRequired: 'Faça login na intranet da equipe para continuar.',
    goIntranet: 'Ir para intranet da equipe',
    loadError: 'Não foi possível carregar o cadastro.',
    loadGeneric: 'Erro ao carregar o cadastro.',
    loading: 'Carregando assistência técnica...',
    notFound: 'Participante não encontrado.',
    backPanel: 'Voltar ao painel',
    notApproved: 'Este cadastro ainda não está aprovado para diagnóstico.',
    assistEyebrow: 'Assistência técnica',
    technician: 'Técnico',
    lastTeamUpdate: 'Última atualização pela equipe',
  },
  en: {
    loginRequired: 'Sign in to the team intranet to continue.',
    goIntranet: 'Go to team intranet',
    loadError: 'Could not load the record.',
    loadGeneric: 'Error loading the record.',
    loading: 'Loading technical assistance...',
    notFound: 'Participant not found.',
    backPanel: 'Back to dashboard',
    notApproved: 'This record is not yet approved for diagnosis.',
    assistEyebrow: 'Technical assistance',
    technician: 'Technician',
    lastTeamUpdate: 'Last team update',
  },
};

export function ProjectTeamDiagnosisAssist({
  locale,
  candidateId,
}: {
  locale: string;
  candidateId: string;
}) {
  const t = copy[getProjectLocaleKey(locale)];
  const [records, setRecords] = useState<AssistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = useMemo(() => readTeamSession(), []);

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      setError(t.loginRequired);
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/projeto/inscriptions', {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          setError(t.loadError);
          return;
        }
        setRecords(payload.records || []);
      } catch {
        setError(t.loadGeneric);
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.token, t.loginRequired, t.loadError, t.loadGeneric]);

  const record = records.find((item) => item.id === candidateId) || null;

  if (loading) {
    return <p className="text-sm text-[#2F3336]/70">{t.loading}</p>;
  }

  if (!session?.token) {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>
        <Link href={`/${locale}/admin`} className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]">
          {t.goIntranet}
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-red-700">{t.notFound}</p>
        <Link href={`/${locale}/admin`} className="mt-4 inline-flex rounded-full border border-[#D9E3EC] px-5 py-2.5 text-sm font-semibold text-[#071F5E]">
          {t.backPanel}
        </Link>
      </div>
    );
  }

  if (record.status !== 'approved') {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-[#2F3336]/80">{t.notApproved}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#CFE8E8] bg-[#F3FAFA] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{t.assistEyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{record.profile.name || record.user.email}</h1>
        <p className="mt-1 text-sm text-[#2F3336]/80">
          {t.technician}: <strong>{session.name}</strong> ({session.email}) · ID {session.memberId}
        </p>
        {record.profile.diagnosis?.submittedBy?.type === 'team' ? (
          <p className="mt-2 text-sm text-[#1D6359]">
            {t.lastTeamUpdate}: {record.profile.diagnosis.submittedBy.teamMemberName || '—'}
          </p>
        ) : null}
      </div>

      <ProjectDiagnosisForm
        locale={locale}
        teamAssist={{
          token: session.token,
          memberName: session.name,
          record: {
            id: record.id,
            status: record.status,
            user: record.user,
            profile: record.profile,
          },
        }}
      />
    </div>
  );
}
