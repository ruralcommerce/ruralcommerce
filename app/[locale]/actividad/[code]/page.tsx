import { ActividadInvite } from '@/components/actividades/ActividadInvite';

export default function Page({ params }: { params: { locale: string; code: string } }) {
  return <ActividadInvite locale={params.locale} code={params.code} />;
}
