import { IntranetLogin } from '@/components/intranet/IntranetLogin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies } from '@/lib/intranet/auth';

export default function IntranetPage({ params }: { params: { locale: string } }) {
  const session = getSessionFromCookies(cookies());
  if (session) {
    redirect(`/${params.locale}/intranet/dashboard`);
  }
  return <IntranetLogin locale={params.locale} />;
}
