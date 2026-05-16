import { NextRequest, NextResponse } from 'next/server';
import { generateTranslationPreviewServer } from '@/lib/translation-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceLayout, targetLocales, changedFields, sourceLocale } = body as {
      sourceLayout?: unknown;
      targetLocales?: string[];
      changedFields?: string[];
      sourceLocale?: string;
    };

    if (!sourceLayout || !Array.isArray(targetLocales) || !Array.isArray(changedFields)) {
      return NextResponse.json(
        { error: 'Payload inválido: sourceLayout, targetLocales e changedFields são obrigatórios.' },
        { status: 400 }
      );
    }

    if (changedFields.some((f) => typeof f !== 'string')) {
      return NextResponse.json({ error: 'changedFields deve ser um array de strings.' }, { status: 400 });
    }

    const fromLocale =
      typeof sourceLocale === 'string' && sourceLocale.trim() ? sourceLocale.trim() : 'es';

    const previews = await generateTranslationPreviewServer(
      sourceLayout,
      targetLocales,
      changedFields,
      fromLocale
    );
    return NextResponse.json(previews);
  } catch (error) {
    console.error('POST /api/editor/translate:', error);
    return NextResponse.json({ error: 'Erro ao gerar traduções.' }, { status: 500 });
  }
}
