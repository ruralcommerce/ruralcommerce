import { IntranetPermissionsPage } from '@/components/intranet/IntranetPermissionsPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetPermissionsPage locale={params.locale} />;
}
