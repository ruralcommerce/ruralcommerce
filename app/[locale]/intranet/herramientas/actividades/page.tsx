import { ActividadesTool } from '@/components/actividades/ActividadesTool';

export default function Page({ params }: { params: { locale: string } }) {
  return <ActividadesTool locale={params.locale} />;
}
