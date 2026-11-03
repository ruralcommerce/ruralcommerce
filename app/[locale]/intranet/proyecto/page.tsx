import { IntranetProyectoPage } from '@/components/intranet/IntranetProyectoPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetProyectoPage locale={params.locale} />;
}
