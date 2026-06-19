import { ProjectAdminDashboard } from '@/components/ProjectAdminDashboard';
import { ProjectFlowNav } from '@/components/ProjectFlowNav';

export default function AdminPage({ params }: { params: { locale: string } }) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <ProjectFlowNav locale={params.locale} currentPage="admin" className="mb-4" />
        <ProjectAdminDashboard locale={params.locale} />
      </div>
    </main>
  );
}
