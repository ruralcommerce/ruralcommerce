import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies, sessionHas } from '@/lib/intranet/auth';
import { intranetHomePath } from '@/lib/intranet/home';

/** Compat: /admin → unified intranet (proyecto module or login). */
export default function AdminPage({ params }: { params: { locale: string } }) {
  const session = getSessionFromCookies(cookies());
  if (session && sessionHas(session, 'projeto.access')) {
    redirect(`/${params.locale}/intranet/proyecto`);
  }
  if (session) {
    redirect(intranetHomePath(params.locale, session));
  }
  redirect(`/${params.locale}/intranet`);
}
