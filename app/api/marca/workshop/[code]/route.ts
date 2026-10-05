import { NextResponse } from 'next/server';
import { pickSectionRepresentatives, stripTagsForPublic } from '@/lib/marca/catalog';
import { getCatalogByIds, listCatalogImages, replaceCatalogFromSeed } from '@/lib/marca/catalog-store';
import { getContractByCode } from '@/lib/marca/store';
import { MARCA_WORD_BANK, type MarcaImage, type MarcaPublicWorkshop, type MarcaSection } from '@/lib/marca/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

function isStyleRef(img: MarcaImage) {
  return img.section === 'logo' || img.section === 'packaging';
}

/** Ensure estilo step has a large unique bank even if the contract picked few images. */
function expandStyleBank(selected: MarcaImage[], full: MarcaImage[]): MarcaImage[] {
  const byId = new Map(selected.map((img) => [img.id, img]));
  const styleInSelected = [...byId.values()].filter(isStyleRef).length;
  if (styleInSelected >= 24) return selected;

  for (const img of full) {
    if (img.active === false) continue;
    if (!isStyleRef(img)) continue;
    if (byId.has(img.id)) continue;
    byId.set(img.id, img);
  }
  return [...byId.values()];
}

export async function GET(_request: Request, { params }: Params) {
  const contract = await getContractByCode(params.code);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let catalog = await getCatalogByIds(contract.imageIds);
  if (catalog.length === 0) {
    await replaceCatalogFromSeed();
    catalog = await getCatalogByIds(contract.imageIds);
  }

  const fullLibrary = await listCatalogImages();
  catalog = expandStyleBank(catalog, fullLibrary);

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
