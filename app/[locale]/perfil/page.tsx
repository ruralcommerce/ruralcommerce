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
    <ProjectPageShell
      locale={params.locale}
      currentPage="perfil"
      contentClassName="mx-auto flex w-full max-w-6xl flex-col px-3 sm:px-6 lg:px-8"
    >
      <ProjectProfileDashboard locale={params.locale} initialEmail={email} />
    </ProjectPageShell>
  );
}
