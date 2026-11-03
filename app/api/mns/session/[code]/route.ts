import { NextResponse } from 'next/server';
import { getSessionByCode } from '@/lib/mns/store';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSessionByCode(params.code);
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    session: {
      code: session.code,
      title: session.title,
      groupName: session.groupName,
      status: session.status,
      locale: session.locale,
    },
  });
}
