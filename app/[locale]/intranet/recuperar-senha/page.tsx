import { IntranetPasswordReset } from '@/components/intranet/IntranetPasswordReset';

export default function IntranetRecuperarSenhaPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { email?: string; token?: string };
}) {
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';

  return <IntranetPasswordReset locale={params.locale} initialEmail={email} initialToken={token} />;
}
