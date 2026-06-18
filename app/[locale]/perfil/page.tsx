import { ProjectProfileDashboard } from '@/components/ProjectProfileDashboard';
import { ProjectFlowNav } from '@/components/ProjectFlowNav';

export default function PerfilPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { email?: string };
}) {
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ProjectFlowNav locale={params.locale} currentPage="perfil" className="mb-4" />
        <ProjectProfileDashboard initialEmail={email} />
      </div>
    </main>
  );
}
