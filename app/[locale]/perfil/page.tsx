import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies, sessionHas } from '@/lib/intranet/auth';
import { intranetHomePath } from '@/lib/intranet/home';

/** Compat: /perfil → unified intranet (mi-recorrido or login). */
export default function PerfilPage({ params }: { params: { locale: string } }) {
  const session = getSessionFromCookies(cookies());
  if (session && sessionHas(session, 'benef.access')) {
    redirect(`/${params.locale}/intranet/mi-recorrido`);
  }
  if (session) {
    redirect(intranetHomePath(params.locale, session));
  }
  redirect(`/${params.locale}/intranet`);
}
