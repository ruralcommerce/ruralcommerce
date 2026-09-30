import { IntranetDashboard } from '@/components/intranet/IntranetDashboard';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetDashboard locale={params.locale} />;
}
