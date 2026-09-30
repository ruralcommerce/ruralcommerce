import { IntranetUsersPage } from '@/components/intranet/IntranetUsersPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetUsersPage locale={params.locale} kind="collaborator" />;
}
