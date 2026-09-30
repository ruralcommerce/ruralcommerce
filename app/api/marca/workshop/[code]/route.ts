import { NextResponse } from 'next/server';
import { stripTagsForPublic } from '@/lib/marca/catalog';
import { getCatalogByIds } from '@/lib/marca/catalog-store';
import { getContractByCode } from '@/lib/marca/store';
import type { MarcaPublicWorkshop } from '@/lib/marca/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function GET(_request: Request, { params }: Params) {
  const contract = await getContractByCode(params.code);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const images = stripTagsForPublic(await getCatalogByIds(contract.imageIds));
  const workshop: MarcaPublicWorkshop = {
    code: contract.code,
    title: contract.title,
    clientName: contract.clientName,
    status: contract.status,
    images,
  };

  return NextResponse.json({ workshop });
}
