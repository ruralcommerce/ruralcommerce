import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlantaShell } from '@/components/planta/PlantaShell';
import { PLANTA_COOKIE, verifyPlantaSession } from '@/lib/planta-session';

export default function PlantaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = verifyPlantaSession(cookies().get(PLANTA_COOKIE)?.value);
  if (!session) {
    redirect(`/${params.locale}/impulsacr/convite`);
  }

  return (
    <PlantaShell locale={params.locale} guestName={session.name}>
      {children}
    </PlantaShell>
  );
}
