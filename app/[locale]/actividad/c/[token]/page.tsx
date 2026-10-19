import { ActividadConfirm } from '@/components/actividades/ActividadConfirm';

export default function Page({ params }: { params: { locale: string; token: string } }) {
  return <ActividadConfirm locale={params.locale} token={params.token} />;
}
