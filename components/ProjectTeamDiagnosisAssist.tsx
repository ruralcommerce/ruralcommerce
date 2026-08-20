'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProjectDiagnosisForm } from '@/components/ProjectDiagnosisForm';
import { readTeamSession } from '@/lib/project-team-session-client';

type AssistRecord = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: { email: string };
  profile: {
    name?: string;
    agreement?: { signed?: boolean };
    diagnosis?: {
      submittedBy?: {
        type?: string;
        teamMemberName?: string;
      };
    };
  };
};

export function ProjectTeamDiagnosisAssist({
  locale,
  candidateId,
}: {
  locale: string;
  candidateId: string;
}) {
  const [records, setRecords] = useState<AssistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = useMemo(() => readTeamSession(), []);

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      setError('Faça login na intranet da equipe para continuar.');
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/projeto/inscriptions', {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          setError('Não foi possível carregar o cadastro.');
          return;
        }
        setRecords(payload.records || []);
      } catch {
        setError('Erro ao carregar o cadastro.');
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.token]);

  const record = records.find((item) => item.id === candidateId) || null;

  if (loading) {
    return <p className="text-sm text-[#2F3336]/70">Carregando assistência técnica...</p>;
  }

  if (!session?.token) {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>
        <Link href={`/${locale}/admin`} className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]">
          Ir para intranet da equipe
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-red-700">Participante não encontrado.</p>
        <Link href={`/${locale}/admin`} className="mt-4 inline-flex rounded-full border border-[#D9E3EC] px-5 py-2.5 text-sm font-semibold text-[#071F5E]">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  if (record.status !== 'approved') {
    return (
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6">
        <p className="text-sm text-[#2F3336]/80">Este cadastro ainda não está aprovado para diagnóstico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#CFE8E8] bg-[#F3FAFA] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">Assistência técnica</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{record.profile.name || record.user.email}</h1>
        <p className="mt-1 text-sm text-[#2F3336]/80">
          Técnico: <strong>{session.name}</strong> ({session.email}) · ID {session.memberId}
        </p>
        {record.profile.diagnosis?.submittedBy?.type === 'team' ? (
          <p className="mt-2 text-sm text-[#1D6359]">
            Última atualização pela equipe: {record.profile.diagnosis.submittedBy.teamMemberName || '—'}
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
