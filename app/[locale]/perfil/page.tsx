import { ProjectPageShell } from '@/components/ProjectPageShell';
import { ProjectProfileDashboard } from '@/components/ProjectProfileDashboard';

export default function PerfilPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { email?: string };
}) {
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';

  return (
    <ProjectPageShell locale={params.locale} currentPage="perfil">
      <ProjectProfileDashboard locale={params.locale} initialEmail={email} />
    </ProjectPageShell>
  );
}
