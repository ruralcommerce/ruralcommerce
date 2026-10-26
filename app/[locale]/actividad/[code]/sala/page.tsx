import { ActividadSala } from '@/components/actividades/ActividadSala';

export default function Page({ params }: { params: { locale: string; code: string } }) {
  return <ActividadSala locale={params.locale} code={params.code} />;
}
