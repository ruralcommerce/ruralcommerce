/**
 * Copia `blocks` de cada `*.es.json` para `*.pt-BR.json` e `*.en.json` no mesmo diretório.
 * Preserva em cada destino: name, title, status, publishedAt, createdAt, locale, id, slug.
 *
 * ATENÇÃO: o conteúdo textual dentro dos blocos (hero, rodapé, etc.) fica IGUAL ao espanhol
 * nos ficheiros PT e EN. Só use se quiser mesmo essa cópia total; senão use o editor
 * "Sincronizar layout" com cuidado ou tradução assistida.
 *
 * Uso: node scripts/sync-layouts-from-es.mjs
 */

import fs from 'fs';
import path from 'path';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');
const TARGET_LOCALES = ['pt-BR', 'en'];

const esFiles = fs.readdirSync(LAYOUTS_DIR).filter((f) => f.endsWith('.es.json'));

for (const esFile of esFiles) {
  const slug = esFile.replace(/\.es\.json$/, '');
  const esPath = path.join(LAYOUTS_DIR, esFile);
  const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

  if (!es || !Array.isArray(es.blocks)) {
    console.warn('Ignorado (sem blocks):', esFile);
    continue;
  }

  for (const loc of TARGET_LOCALES) {
    const outName = `${slug}.${loc}.json`;
    const outPath = path.join(LAYOUTS_DIR, outName);
    let target = {};
    if (fs.existsSync(outPath)) {
      target = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    } else {
      target = { ...es, locale: loc };
    }

    const next = {
      ...es,
      blocks: JSON.parse(JSON.stringify(es.blocks)),
      locale: loc,
      updatedAt: new Date().toISOString(),
      id: target.id ?? es.id,
      name: target.name ?? es.name,
      title: target.title ?? es.title,
      status: target.status ?? es.status,
      publishedAt: target.publishedAt ?? es.publishedAt,
      createdAt: target.createdAt ?? es.createdAt,
    };

    fs.writeFileSync(outPath, JSON.stringify(next, null, 2));
    console.log('OK', outName);
  }
}

console.log('Feito:', esFiles.length, 'arquivo(s) ES →', TARGET_LOCALES.join(', '));
