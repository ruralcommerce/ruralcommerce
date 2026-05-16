'use client';

/**
 * PropertyEditor - Painel de edição de propriedades
 * Permite editar as propriedades do bloco selecionado
 */

import { useEditorStore } from '@/lib/editor-store';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import { findBlockPath } from '@/lib/editor-utils';
import { EditorHtmlTextarea } from './EditorHtmlTextarea';
import { EditorColorField } from './EditorColorField';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MediaLibraryModal } from './MediaLibraryModal';
import { BlogTranslateModal } from './BlogTranslateModal';
import { getJsonValidationMessage as getSharedJsonValidationMessage } from '@/lib/json-prop-validation';
import { StatsIndicatorsEditor } from './StatsIndicatorsEditor';

type JsonEditorValue = string | number | boolean | null | JsonEditorValue[] | { [key: string]: JsonEditorValue };

function categorizeEditorProp(key: string): 'content' | 'style' | 'advanced' {
  const lower = key.toLowerCase();
  if (
    lower.startsWith('margin') ||
    lower.startsWith('padding') ||
    lower.includes('hidden') ||
    lower.includes('hideonmobile') ||
    lower === 'classname' ||
    lower === 'anchorid' ||
    lower.includes('animation') ||
    lower === 'zindex'
  ) {
    return 'advanced';
  }
  if (
    lower.includes('color') ||
    lower === 'backgroundcolor' ||
    lower === 'fontsize' ||
    lower === 'textalign' ||
    lower === 'align' ||
    lower === 'height' ||
    lower.includes('width') ||
    lower === 'thickness' ||
    lower === 'gap' ||
    lower === 'layout' ||
    lower === 'level' ||
    lower === 'showborder' ||
    lower.includes('shadow') ||
    lower === 'opacity' ||
    lower.includes('gridtemplate') ||
    lower === 'borderradius'
  ) {
    return 'style';
  }
  return 'content';
}

function isColorLikeEditorProp(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower.includes('radius')) return false;
  if (lower.includes('json')) return false;
  if (lower.includes('embed') && lower.includes('url')) return false;
  return (
    lower === 'color' ||
    lower.endsWith('color') ||
    lower === 'leftpanelbg' ||
    lower === 'pagebg' ||
    lower === 'barcolor'
  );
}

function isImageField(propName: string): boolean {
  const normalized = propName.toLowerCase();
  return normalized.includes('image') || normalized === 'src';
}

function getJsonValidationMessage(propName: string, value: unknown): string | null {
  return getSharedJsonValidationMessage(propName, value);
}

function parseJsonArray(value: string): Record<string, string>[] | null {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;

    const normalized = parsed.map((item) => {
      if (!item || typeof item !== 'object') {
        return { value: String(item ?? '') };
      }

      return Object.fromEntries(
        Object.entries(item).map(([key, val]) => [key, String(val ?? '')])
      );
    });

    return normalized;
  } catch {
    return null;
  }
}

function parseJsonEditorValue(value: string): JsonEditorValue[] | null {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as JsonEditorValue[]) : null;
  } catch {
    return null;
  }
}

function stringifyJsonEditorValue(items: JsonEditorValue[]): string {
  return JSON.stringify(items, null, 2);
}

function setValueAtPath(root: JsonEditorValue, path: (string | number)[], nextValue: JsonEditorValue): JsonEditorValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [head, ...rest] = path;

  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setValueAtPath(copy[head as number], rest, nextValue);
    return copy;
  }

  if (root && typeof root === 'object') {
    return {
      ...root,
      [head]: setValueAtPath((root as Record<string, JsonEditorValue>)[head as string], rest, nextValue),
    };
  }

  return root;
}

function removeValueAtPath(root: JsonEditorValue, path: (string | number)[]): JsonEditorValue {
  if (path.length === 0) {
    return root;
  }

  const [head, ...rest] = path;

  if (Array.isArray(root)) {
    const copy = [...root];
    if (rest.length === 0) {
      copy.splice(head as number, 1);
      return copy;
    }
    copy[head as number] = removeValueAtPath(copy[head as number], rest);
    return copy;
  }

  if (root && typeof root === 'object') {
    const copy = { ...(root as Record<string, JsonEditorValue>) };
    if (rest.length === 0) {
      delete copy[head as string];
      return copy;
    }
    copy[head as string] = removeValueAtPath(copy[head as string], rest);
    return copy;
  }

  return root;
}

function moveArrayItem(root: JsonEditorValue[], path: (string | number)[], from: number, to: number): JsonEditorValue[] {
  const target = path.length === 0 ? root : path.reduce<JsonEditorValue>((acc, part) => {
    if (Array.isArray(acc)) {
      return acc[part as number];
    }
    return (acc as Record<string, JsonEditorValue>)[part as string];
  }, root);

  if (!Array.isArray(target) || from < 0 || to < 0 || from >= target.length || to >= target.length) {
    return root;
  }

  const copy = [...target];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);

  return (path.length === 0 ? copy : setValueAtPath(root, path, copy)) as JsonEditorValue[];
}

function stringifyJsonArray(items: Record<string, string>[]): string {
  return JSON.stringify(items, null, 2);
}

const PARTNER_FIELD_LABELS: Record<string, string> = {
  name: 'Nome do parceiro',
  src: 'URL da imagem do logo',
  href: 'Site do parceiro (link)',
};

function PartnersArrayEditor({
  value,
  onChange,
  onOpenMediaPicker,
}: {
  value: string;
  onChange: (v: string) => void;
  onOpenMediaPicker: (handler: (path: string) => void) => void;
}) {
  const rows = parseJsonArray(value) ?? [];
  const keys =
    rows.length > 0
      ? Object.keys(rows[0])
      : ['name', 'src', 'href'];

  const commit = (next: Record<string, string>[]) => {
    onChange(stringifyJsonArray(next));
  };

  const updateRow = (idx: number, key: string, v: string) => {
    const parsed = parseJsonArray(value) ?? [];
    const next = parsed.map((row, i) => (i === idx ? { ...row, [key]: v } : row));
    commit(next);
  };

  const addRow = () => {
    const parsed = parseJsonArray(value) ?? [];
    const empty = Object.fromEntries(keys.map((k) => [k, ''])) as Record<string, string>;
    commit([...parsed, empty]);
  };

  const removeRow = (idx: number) => {
    const parsed = parseJsonArray(value) ?? [];
    commit(parsed.filter((_, i) => i !== idx));
  };

  const moveRow = (from: number, to: number) => {
    const parsed = parseJsonArray(value) ?? [];
    if (to < 0 || to >= parsed.length || from < 0 || from >= parsed.length) return;
    const c = [...parsed];
    const [m] = c.splice(from, 1);
    c.splice(to, 0, m);
    commit(c);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-slate-600">
        Cada card é um logo no carrossel. Cole a <strong>URL da imagem</strong> ou clique numa miniatura da biblioteca
        para preencher o logo. O <strong>link</strong> é o site do parceiro.
      </p>
      {rows.length === 0 ? (
        <button
          type="button"
          onClick={addRow}
          className="rounded border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          + Adicionar primeiro parceiro
        </button>
      ) : null}
      {rows.map((row, idx) => (
        <div key={idx} className="space-y-2 rounded border border-slate-200 bg-slate-50/90 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Parceiro {idx + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveRow(idx, idx - 1)}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={idx === rows.length - 1}
                onClick={() => moveRow(idx, idx + 1)}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
              >
                Remover
              </button>
            </div>
          </div>
          {keys.map((k) => (
            <div key={k} className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                {PARTNER_FIELD_LABELS[k] ?? k}
              </label>
              {k === 'src' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={row[k] ?? ''}
                    onChange={(e) => updateRow(idx, k, e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker((p) => updateRow(idx, 'src', p))}
                    className="w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100"
                  >
                    Escolher imagem da biblioteca…
                  </button>
                  {row.src ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.src} alt="" className="mx-auto max-h-24 object-contain p-2" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <input
                  type="text"
                  value={row[k] ?? ''}
                  onChange={(e) => updateRow(idx, k, e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      {rows.length > 0 ? (
        <button
          type="button"
          onClick={addRow}
          className="rounded border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          + Adicionar parceiro
        </button>
      ) : null}
    </div>
  );
}

export function PropertyEditor({
  embedded = false,
  editorLocale = 'es',
  onBlogFilesChanged,
}: {
  embedded?: boolean;
  /** Locale do editor (para tradução / comparar blog). */
  editorLocale?: string;
  /** Chamado após tradução automática dos ficheiros `posts.*.json`. */
  onBlogFilesChanged?: () => void;
} = {}) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const [blogTranslateOpen, setBlogTranslateOpen] = useState(false);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const mediaPickRef = useRef<((path: string) => void) | null>(null);

  const loadMediaImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/editor/media?_=${Date.now()}`, { cache: 'no-store', credentials: 'include' });
      if (!response.ok) return;
      const data = (await response.json()) as { images?: string[] };
      if (Array.isArray(data.images)) {
        setMediaImages(data.images);
      }
    } catch {
      setMediaImages([]);
    }
  }, []);

  useEffect(() => {
    void loadMediaImages();
  }, [loadMediaImages]);

  const openMediaPicker = useCallback((handler: (path: string) => void) => {
    mediaPickRef.current = handler;
    setMediaModalOpen(true);
  }, []);

  const closeMediaPicker = useCallback(() => {
    setMediaModalOpen(false);
    mediaPickRef.current = null;
  }, []);

  const handleMediaPicked = useCallback(
    (path: string) => {
      mediaPickRef.current?.(path);
      mediaPickRef.current = null;
      setMediaModalOpen(false);
      void loadMediaImages();
    },
    [loadMediaImages]
  );

  const [propTab, setPropTab] = useState<'content' | 'style' | 'advanced'>('content');

  useEffect(() => {
    setPropTab('content');
  }, [selectedBlockId]);

  const propsByTab = useMemo(() => {
    const buckets: Record<'content' | 'style' | 'advanced', string[]> = {
      content: [],
      style: [],
      advanced: [],
    };
    if (!currentPage || !selectedBlockId) return buckets;
    const path = findBlockPath(currentPage.blocks, selectedBlockId);
    if (!path || path.length === 0) return buckets;
    const block = path[path.length - 1];
    const def = BLOCK_LIBRARY[block.type];
    if (!def) return buckets;
    for (const k of def.editableProps) {
      buckets[categorizeEditorProp(k)].push(k);
    }
    return buckets;
  }, [currentPage, selectedBlockId]);

  const visiblePropKeys = propsByTab[propTab];

  if (!currentPage || !selectedBlockId) {
    return (
      <div className={`flex h-full min-h-0 flex-col bg-slate-50 ${embedded ? '' : 'border-l border-slate-200'}`}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-sm text-slate-900">Propriedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-4 text-center">
          Selecione um bloco para editar suas propriedades
        </div>
      </div>
    );
  }

  const blockPath = findBlockPath(currentPage.blocks, selectedBlockId);
  if (!blockPath || blockPath.length === 0) {
    return null;
  }

  const selectedBlock = blockPath[blockPath.length - 1];
  const blockDef = BLOCK_LIBRARY[selectedBlock.type];

  const handlePropChange = (propKey: string, value: any) => {
    updateBlock(selectedBlockId, {
      props: {
        ...selectedBlock.props,
        [propKey]: value,
      },
    });
  };

  const updateJsonArrayItem = (
    propName: string,
    index: number,
    key: string,
    newValue: string,
    source: string
  ) => {
    const parsed = parseJsonArray(source);
    if (!parsed || !parsed[index]) return;

    parsed[index] = {
      ...parsed[index],
      [key]: newValue,
    };

    handlePropChange(propName, stringifyJsonArray(parsed));
  };

  const removeJsonArrayItem = (propName: string, index: number, source: string) => {
    const parsed = parseJsonArray(source);
    if (!parsed) return;

    const next = parsed.filter((_, i) => i !== index);
    handlePropChange(propName, stringifyJsonArray(next));
  };

  const moveJsonArrayItem = (propName: string, from: number, to: number, source: string) => {
    const parsed = parseJsonArray(source);
    if (!parsed || from < 0 || to < 0 || from >= parsed.length || to >= parsed.length) return;

    const copy = [...parsed];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    handlePropChange(propName, stringifyJsonArray(copy));
  };

  const addJsonArrayItem = (propName: string, source: string) => {
    const parsed = parseJsonArray(source);
    if (!parsed) return;

    const sample = parsed[0] || { title: '', body: '' };
    const emptyItem = Object.fromEntries(Object.keys(sample).map((key) => [key, '']));
    handlePropChange(propName, stringifyJsonArray([...parsed, emptyItem]));
  };

  const renderJsonField = (
    propName: string,
    rootValue: JsonEditorValue[],
    value: JsonEditorValue,
    path: (string | number)[] = [],
    label = 'item'
  ): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{label}</span>
            <button
              type="button"
              onClick={() => handlePropChange(propName, stringifyJsonEditorValue((path.length === 0 ? [...value, ''] : setValueAtPath(rootValue, path, [...value, ''])) as JsonEditorValue[]))}
              className="rounded border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              + Item
            </button>
          </div>
          {value.map((child, index) => (
            <div key={`${path.join('-')}-${index}`} className="space-y-2 rounded border border-slate-200 p-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Item {index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handlePropChange(propName, stringifyJsonEditorValue(moveArrayItem(rootValue, path, index, index - 1)))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === value.length - 1}
                    onClick={() => handlePropChange(propName, stringifyJsonEditorValue(moveArrayItem(rootValue, path, index, index + 1)))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePropChange(propName, stringifyJsonEditorValue(removeValueAtPath(rootValue, [...path, index]) as JsonEditorValue[]))}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                  >
                    Remover
                  </button>
                </div>
              </div>
              {renderJsonField(propName, rootValue, child, [...path, index], `item ${index + 1}`)}
            </div>
          ))}
        </div>
      );
    }

    if (value && typeof value === 'object') {
      return (
        <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
          {Object.entries(value).map(([childKey, childValue]) => (
            <div key={`${path.join('-')}-${childKey}`} className="space-y-1">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {childKey}
              </label>
              {renderJsonField(propName, rootValue, childValue, [...path, childKey], childKey)}
            </div>
          ))}
        </div>
      );
    }

    const primitiveValue = value == null ? '' : String(value);
    return (
      <input
        type="text"
        value={primitiveValue}
        onChange={(e) => handlePropChange(propName, stringifyJsonEditorValue(setValueAtPath(rootValue, path, e.target.value) as JsonEditorValue[]))}
        className="w-full rounded border border-slate-300 p-2 text-sm text-slate-900"
      />
    );
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col bg-gradient-to-b from-slate-50/95 via-white to-slate-50/90 ${embedded ? '' : 'border-l border-slate-200/90'}`}
    >
      <div className="border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-sm">
        <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">Propriedades</h2>
        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">{blockDef.label}</div>
      </div>

      <div className="border-b border-slate-200/80 bg-white/50 px-3 py-2.5">
        <div className="flex rounded-xl bg-slate-100/90 p-1 shadow-inner">
          {(['content', 'style', 'advanced'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPropTab(t)}
              className={`flex-1 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition ${
                propTab === t
                  ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'content' ? 'Conteúdo' : t === 'style' ? 'Estilo' : 'Avançado'}
            </button>
          ))}
        </div>
      </div>

      {selectedBlock.type === 'blog-featured' || selectedBlock.type === 'blog-posts-grid' ? (
        <div className="border-b border-violet-200/80 bg-violet-50/90 px-4 py-3">
          <p className="text-[11px] font-semibold text-violet-900">Conteúdo real dos artigos</p>
          <p className="mt-1 text-[10px] leading-snug text-violet-800/90">
            O texto dos posts está em <code className="rounded bg-white/80 px-1">public/blog-posts</code>. Traduzir
            ou comparar os três idiomas aqui — não depende do histórico «Traduzir» do layout.
          </p>
          <button
            type="button"
            onClick={() => setBlogTranslateOpen(true)}
            className="mt-2 w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-[11px] font-semibold text-violet-900 shadow-sm hover:bg-violet-50"
          >
            Tradução e comparar (ES / PT / EN)…
          </button>
        </div>
      ) : null}

      <div className="editor-scroll flex-1 space-y-4 p-4">
        {visiblePropKeys.length === 0 ? <p className="text-xs text-slate-500">Nenhum campo nesta aba.</p> : null}
        {visiblePropKeys.map((propKey) => {
          const rawValue = selectedBlock.props[propKey];
          const value = rawValue === undefined || rawValue === null ? '' : rawValue;
          const propName = String(propKey);
          const jsonMessage = getJsonValidationMessage(propName, value);
          const hasJsonError = Boolean(jsonMessage && jsonMessage.startsWith('JSON invalido'));
          const parsedJsonValue = typeof value === 'string' && propName.endsWith('Json') && !hasJsonError
            ? parseJsonEditorValue(value)
            : null;

          return (
            <div key={propName} className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 capitalize">
                {propName.replace(/([A-Z])/g, ' $1').trim()}
              </label>

              {typeof value === 'string' && (
                <>
                  {isColorLikeEditorProp(propName) ? (
                    <EditorColorField
                      value={value}
                      onChange={(v) => handlePropChange(propName, v)}
                      allowClear={
                        propName.toLowerCase() === 'hoverbackgroundcolor' ||
                        propName.toLowerCase() === 'hovertextcolor'
                      }
                    />
                  ) : propName === 'hideOnMobile' ? (
                    <select
                      value={String(value)}
                      onChange={(e) => handlePropChange(propName, e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                    >
                      <option value="">Visível em todos os tamanhos</option>
                      <option value="true">Ocultar em mobile (&lt; md)</option>
                    </select>
                  ) : propName === 'gridTemplateColumns' ? (
                    <textarea
                      value={value}
                      onChange={(e) => handlePropChange(propName, e.target.value)}
                      placeholder="Ex.: 2fr 1fr  ou  minmax(0,1fr) minmax(0,2fr)  — sobrepõe o preset de «layout» em ecrãs médios+"
                      rows={3}
                      className="w-full rounded border border-slate-300 bg-white p-2 font-mono text-xs text-slate-900"
                    />
                  ) : propName === 'contentHtml' || propName === 'htmlContent' ? (
                    <EditorHtmlTextarea value={value} onChange={(v) => handlePropChange(propName, v)} rows={14} />
                  ) : propName === 'territoriesGeoJson' || propName === 'formCopyJson' ? (
                    <>
                      <textarea
                        value={value}
                        onChange={(e) => handlePropChange(propName, e.target.value)}
                        className={`w-full rounded border bg-white p-2 font-mono text-xs text-slate-900 ${
                          jsonMessage ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-300'
                        }`}
                        rows={propName === 'territoriesGeoJson' ? 12 : 8}
                        spellCheck={false}
                      />
                      {jsonMessage ? <p className="text-xs text-red-600">{jsonMessage}</p> : null}
                      {propName === 'formCopyJson' ? (
                        <p className="text-[11px] text-slate-500">
                          Objeto JSON opcional. Chaves = textos de contactForm (ex.: leftTitle, labelSubject).
                        </p>
                      ) : null}
                    </>
                  ) : blockDef.type === 'stats-section' && propName === 'statsJson' ? (
                    <StatsIndicatorsEditor
                      value={String(value ?? '')}
                      onChange={(v) => handlePropChange(propName, v)}
                      jsonError={hasJsonError ? jsonMessage : null}
                    />
                  ) : propName.endsWith('Json') && !hasJsonError && parsedJsonValue ? (
                    <div className="space-y-3 rounded border border-slate-200 bg-white p-3">
                      {blockDef.type === 'partners-section' && propName === 'partnersJson' ? (
                        <PartnersArrayEditor
                          value={value}
                          onChange={(v) => handlePropChange(propName, v)}
                          onOpenMediaPicker={openMediaPicker}
                        />
                      ) : (
                        renderJsonField(propName, parsedJsonValue, parsedJsonValue, [], propName)
                      )}
                      {blockDef.type === 'blog-posts-grid' && propName === 'postsJson' ? (
                        <p className="text-xs text-slate-500">
                          Cada item: slug, image, category, title, author.
                        </p>
                      ) : null}

                      <details className="pt-1">
                        <summary className="cursor-pointer text-xs text-slate-500">Editar JSON bruto</summary>
                        <textarea
                          value={value}
                          onChange={(e) => handlePropChange(propName, e.target.value)}
                          className="mt-2 w-full rounded border border-slate-300 p-2 text-xs text-slate-900"
                          rows={8}
                        />
                      </details>
                    </div>
                  ) : value.length > 50 ? (
                    <textarea
                      value={value}
                      onChange={(e) => handlePropChange(propName, e.target.value)}
                      className={`w-full p-2 text-sm border rounded bg-white text-slate-900 ${
                        hasJsonError ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-300'
                      }`}
                      rows={propName.endsWith('Json') ? 10 : 4}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handlePropChange(propName, e.target.value)}
                      className={`w-full p-2 text-sm border rounded bg-white text-slate-900 ${
                        hasJsonError ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-300'
                      }`}
                    />
                  )}
                </>
              )}

              {jsonMessage &&
              !(blockDef.type === 'stats-section' && propName === 'statsJson') ? (
                <p className={`text-xs ${hasJsonError ? 'text-red-600' : 'text-amber-600'}`}>{jsonMessage}</p>
              ) : null}

              {typeof value === 'string' && isImageField(propName) ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker((p) => handlePropChange(propName, p))
                    }
                    className="w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold text-violet-900 shadow-sm hover:bg-violet-100"
                  >
                    Abrir biblioteca de media…
                    <span className="mt-0.5 block font-normal text-[10px] text-violet-800/90">
                      Upload, pastas, busca ou URL externa
                    </span>
                  </button>
                  {mediaImages.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      Ainda não há imagens listadas em <code className="rounded bg-slate-100 px-1">public/images</code>. Carregue ficheiros no modal.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {typeof value === 'string' && isImageField(propName) && value ? (
                <div className="overflow-hidden rounded border border-slate-200 bg-slate-100">
                  <img
                    src={value}
                    alt="Preview"
                    className="h-28 w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : null}

              {typeof value === 'number' && (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handlePropChange(propName, Number(e.target.value))}
                  className="w-full p-2 text-sm border border-slate-300 rounded bg-white text-slate-900"
                />
              )}

              {typeof value === 'boolean' && (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePropChange(propName, e.target.checked)}
                  className="w-4 h-4"
                />
              )}
            </div>
          );
        })}
      </div>

      <MediaLibraryModal
        open={mediaModalOpen}
        onClose={closeMediaPicker}
        onSelect={handleMediaPicked}
        images={mediaImages}
        onRefresh={loadMediaImages}
      />

      <BlogTranslateModal
        open={blogTranslateOpen}
        onClose={() => setBlogTranslateOpen(false)}
        defaultSourceLocale={editorLocale}
        onApplied={() => onBlogFilesChanged?.()}
      />
    </div>
  );
}
