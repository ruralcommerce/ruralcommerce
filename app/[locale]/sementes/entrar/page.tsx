import { SementesCarta } from '@/components/sementes/SementesCarta';

export default function SementesEntrarPage({ params }: { params: { locale: string } }) {
  return <SementesCarta locale={params.locale} mode="entrar" />;
}
