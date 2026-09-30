import { NextResponse } from 'next/server';
import { pickSectionRepresentatives, stripTagsForPublic } from '@/lib/marca/catalog';
import { getCatalogByIds, replaceCatalogFromSeed } from '@/lib/marca/catalog-store';
import { getContractByCode } from '@/lib/marca/store';
import { MARCA_WORD_BANK, type MarcaPublicWorkshop, type MarcaSection } from '@/lib/marca/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function GET(_request: Request, { params }: Params) {
  const contract = await getContractByCode(params.code);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let catalog = await getCatalogByIds(contract.imageIds);
  if (catalog.length === 0) {
    await replaceCatalogFromSeed();
    catalog = await getCatalogByIds(contract.imageIds);
  }

  const sections = {
    palette: pickSectionRepresentatives(catalog, 'palette'),
    logo: pickSectionRepresentatives(catalog, 'logo'),
    packaging: pickSectionRepresentatives(catalog, 'packaging'),
  } as Record<MarcaSection, ReturnType<typeof pickSectionRepresentatives>>;

  const workshop: MarcaPublicWorkshop = {
    code: contract.code,
    title: contract.title,
    clientName: contract.clientName,
    status: contract.status,
    images: stripTagsForPublic(catalog),
    sections,
    wordBank: MARCA_WORD_BANK,
  };

  return NextResponse.json({ workshop });
}
