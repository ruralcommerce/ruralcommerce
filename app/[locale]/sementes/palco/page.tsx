import { SementesPalco } from '@/components/sementes/SementesPalco';

export default function SementesPalcoPage({ params }: { params: { locale: string } }) {
  return <SementesPalco locale={params.locale} />;
}
