import { IntranetLogin } from '@/components/intranet/IntranetLogin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies } from '@/lib/intranet/auth';
import { intranetHomePath } from '@/lib/intranet/home';

export default function IntranetPage({ params }: { params: { locale: string } }) {
  const session = getSessionFromCookies(cookies());
  if (session) {
    redirect(intranetHomePath(params.locale, session));
  }
  return <IntranetLogin locale={params.locale} />;
}
