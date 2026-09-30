import { IntranetApp } from '@/components/marca/IntranetApp';

export default function IntranetPage({ params }: { params: { locale: string } }) {
  return <IntranetApp locale={params.locale} />;
}
