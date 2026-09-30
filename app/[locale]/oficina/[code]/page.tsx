import { WorkshopApp } from '@/components/marca/WorkshopApp';

export default function OficinaPage({ params }: { params: { locale: string; code: string } }) {
  return <WorkshopApp locale={params.locale} code={params.code} />;
}
