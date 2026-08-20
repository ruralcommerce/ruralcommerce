import { ProjectPageShell } from '@/components/ProjectPageShell';
import { ProjectTeamDiagnosisAssist } from '@/components/ProjectTeamDiagnosisAssist';

export default function TeamAssistPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  return (
    <ProjectPageShell locale={params.locale} currentPage="admin">
      <ProjectTeamDiagnosisAssist locale={params.locale} candidateId={params.id} />
    </ProjectPageShell>
  );
}
