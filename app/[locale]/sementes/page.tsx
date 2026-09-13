import { SementesPlay } from '@/components/sementes/SementesPlay';

export default function SementesPage({ params }: { params: { locale: string } }) {
  return <SementesPlay locale={params.locale} />;
}
