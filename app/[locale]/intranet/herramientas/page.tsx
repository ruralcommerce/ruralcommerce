import { IntranetToolsPage } from '@/components/intranet/IntranetToolsPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetToolsPage locale={params.locale} />;
}
