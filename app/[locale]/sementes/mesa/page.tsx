import { SementesMesa } from '@/components/sementes/SementesMesa';

export default function SementesMesaPage({ params }: { params: { locale: string } }) {
  return <SementesMesa locale={params.locale} />;
}
