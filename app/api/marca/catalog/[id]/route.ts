import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { deleteCatalogImage, listCatalogImages, upsertCatalogImage } from '@/lib/marca/catalog-store';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    src?: string;
    alt?: string;
    tags?: string[];
    moodColor?: string;
    active?: boolean;
  };

  const all = await listCatalogImages({ includeInactive: true });
  const current = all.find((img) => img.id === params.id);
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const image = await upsertCatalogImage({
    id: params.id,
    alt: body.alt !== undefined ? body.alt : current.alt,
    tags: body.tags !== undefined ? body.tags : current.tags,
    src: body.src !== undefined ? body.src : current.src,
    moodColor: body.moodColor !== undefined ? body.moodColor : current.moodColor,
    active: body.active !== undefined ? body.active : current.active,
  });

  return NextResponse.json({ image });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const ok = await deleteCatalogImage(params.id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
