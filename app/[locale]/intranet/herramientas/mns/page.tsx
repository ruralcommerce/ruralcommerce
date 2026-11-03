import { MnsToolApp } from '@/components/mns/MnsToolApp';

export default function IntranetMnsPage({ params }: { params: { locale: string } }) {
  return <MnsToolApp locale={params.locale} />;
}
