import { MnsWorkshopApp } from '@/components/mns/MnsWorkshopApp';

export default function MnsSalaPage({ params }: { params: { locale: string; code: string } }) {
  return <MnsWorkshopApp locale={params.locale} code={params.code} />;
}
