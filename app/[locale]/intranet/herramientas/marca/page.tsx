import { MarcaToolApp } from '@/components/marca/MarcaToolApp';

export default function Page({ params }: { params: { locale: string } }) {
  return <MarcaToolApp locale={params.locale} />;
}
