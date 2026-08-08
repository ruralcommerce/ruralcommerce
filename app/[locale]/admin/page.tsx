import { ProjectAdminDashboard } from '@/components/ProjectAdminDashboard';
import { ProjectPageShell } from '@/components/ProjectPageShell';

export default function AdminPage({ params }: { params: { locale: string } }) {
  return (
    <ProjectPageShell
      locale={params.locale}
      contentClassName="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8"
    >
      <ProjectAdminDashboard locale={params.locale} />
    </ProjectPageShell>
  );
}
