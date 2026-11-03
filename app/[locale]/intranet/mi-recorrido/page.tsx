import { IntranetMiRecorridoPage } from '@/components/intranet/IntranetMiRecorridoPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <IntranetMiRecorridoPage locale={params.locale} />;
}
