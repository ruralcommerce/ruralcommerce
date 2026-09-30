import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { getCatalogByIds } from '@/lib/marca/catalog-store';
import { isGeminiConfigured, synthesizeWorkshopWithGemini } from '@/lib/marca/gemini-moodboard';
import { getContractById } from '@/lib/marca/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Params = { params: { id: string } };

export async function POST(_request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: 'Gemini no configurado. Añade GEMINI_API_KEY en el servidor.' },
      { status: 503 }
    );
  }

  const contract = await getContractById(params.id);
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const images = await getCatalogByIds(contract.imageIds);
  try {
    const { board, ai } = await synthesizeWorkshopWithGemini(contract, images);
    return NextResponse.json({ board, ai });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar con Gemini';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
