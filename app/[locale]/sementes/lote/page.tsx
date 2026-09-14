import { LoteGame } from '@/components/sementes/LoteGame';

export default function SementesLotePage({ params }: { params: { locale: string } }) {
  return <LoteGame locale={params.locale} />;
}
