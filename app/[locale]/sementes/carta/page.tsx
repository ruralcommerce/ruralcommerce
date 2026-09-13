import { SementesCarta } from '@/components/sementes/SementesCarta';

export default function SementesCartaPage({ params }: { params: { locale: string } }) {
  return <SementesCarta locale={params.locale} />;
}
