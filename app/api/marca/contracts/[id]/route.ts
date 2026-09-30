import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { getCatalogByIds } from '@/lib/marca/catalog-store';
import { computeVisualProfile } from '@/lib/marca/profile';
import { getContractById, updateContract } from '@/lib/marca/store';
import type { MarcaContractStatus, MarcaLocale } from '@/lib/marca/types';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const contract = await getContractById(params.id);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const images = await getCatalogByIds(contract.imageIds);
  const profile = computeVisualProfile(contract, images);
  return NextResponse.json({ contract, profile });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    clientName?: string;
    title?: string;
    notes?: string;
    status?: MarcaContractStatus;
    locale?: MarcaLocale;
    imageIds?: string[];
  };

  const contract = await updateContract(params.id, body);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const images = await getCatalogByIds(contract.imageIds);
  const profile = computeVisualProfile(contract, images);
  return NextResponse.json({ contract, profile });
}
