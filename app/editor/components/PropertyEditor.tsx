'use client';

/**
 * PropertyEditor - Painel de edição de propriedades
 * Permite editar as propriedades do bloco selecionado
 */

import { useEditorStore } from '@/lib/editor-store';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import { findBlockPath } from '@/lib/editor-utils';
import { useEffect, useState } from 'react';

type JsonEditorValue = string | number | boolean | null | JsonEditorValue[] | { [key: string]: JsonEditorValue };

function isImageField(propName: string): boolean {
  const normalized = propName.toLowerCase();
  return normalized.includes('image') || normalized === 'src';
}

function getJsonValidationMessage(propName: string, value: unknown): string | null {
  if (!propName.endsWith('Json') || typeof value !== 'string') {
    return null;
  }

  if (value.trim().length === 0) {
    return 'Campo JSON vazio. Use ao menos [] para lista vazia.';
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return 'JSON valido, mas o formato esperado e um array (ex.: [...]).';
    }
    return null;
  } catch {
    return 'JSON invalido. Verifique virgulas, aspas e colchetes.';
  }
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

export function PropertyEditor({ embedded = false }: { embedded?: boolean } = {}) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');

  useEffect(() => {
    let canceled = false;

    const loadMediaImages = async () => {
      try {
        const response = await fetch('/api/editor/media', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as { images?: string[] };
        if (!canceled && Array.isArray(data.images)) {
          setMediaImages(data.images);
        }
      } catch {
        if (!canceled) {
          setMediaImages([]);
        }
      }
    };

    loadMediaImages();

    return () => {
      canceled = true;
    };
  }, []);

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

  const copyImagePath = async (imagePath: string) => {
    try {
      await navigator.clipboard.writeText(imagePath);
    } catch {
      // Ignore clipboard failures in unsupported contexts.
    }
  };

  const filteredMediaImages = mediaImages.filter((imagePath) =>
    imagePath.toLowerCase().includes(mediaSearch.trim().toLowerCase())
  );

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
    <div className={`flex h-full min-h-0 flex-col bg-slate-50 ${embedded ? '' : 'border-l border-slate-200'}`}>
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-sm text-slate-900">Propriedades</h2>
        <div className="text-xs text-slate-500 mt-1">{blockDef.label}</div>
      </div>

      <div className="editor-scroll flex-1 space-y-4 p-4">
        {blockDef.editableProps.map((propKey) => {
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
                  {propName.endsWith('Json') && !hasJsonError && parsedJsonValue ? (
                    <div className="space-y-3 rounded border border-slate-200 bg-white p-3">
                      {renderJsonField(propName, parsedJsonValue, parsedJsonValue, [], propName)}

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

              {jsonMessage ? (
                <p className={`text-xs ${hasJsonError ? 'text-red-600' : 'text-amber-600'}`}>{jsonMessage}</p>
              ) : null}

              {typeof value === 'string' && isImageField(propName) && mediaImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Biblioteca de midia
                    </div>
                    <span className="text-[10px] text-slate-400">{filteredMediaImages.length} itens</span>
                  </div>
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Buscar imagem..."
                    className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {filteredMediaImages.map((imagePath) => {
                      const isSelected = value === imagePath;

                      return (
                        <div
                          key={`${propName}-${imagePath}`}
                          className={`overflow-hidden rounded border bg-white ${
                            isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                          }`}
                          title={imagePath}
                        >
                          <button
                            type="button"
                            onClick={() => handlePropChange(propName, imagePath)}
                            className="w-full text-left transition hover:opacity-90"
                          >
                            <img src={imagePath} alt={imagePath} className="h-16 w-full object-cover" />
                            <div className="truncate px-1 py-1 text-[10px] text-slate-600">{imagePath}</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyImagePath(imagePath)}
                            className="w-full border-t border-slate-200 px-1 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Copiar caminho
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {filteredMediaImages.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhuma imagem encontrada para esse filtro.</p>
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

              {propName.toLowerCase().includes('color') && typeof value === 'string' && (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handlePropChange(propName, e.target.value)}
                    className="w-full h-10 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 px-2 py-2">{value}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
