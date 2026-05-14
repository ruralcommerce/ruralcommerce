'use client';

/**
 * TranslationPreviewModal - Revisar, editar e aprovar traduções antes de aplicar.
 */

import { useEffect, useState } from 'react';
import { TranslationPreview, TranslationChange } from '@/lib/translation-utils';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface TranslationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previews: TranslationPreview[];
  onApprove: (approvedChanges: TranslationChange[]) => void;
  isTranslating?: boolean;
}

function changeKey(c: TranslationChange): string {
  return `${c.targetLocale}-${c.field}`;
}

export function TranslationPreviewModal({
  isOpen,
  onClose,
  previews,
  onApprove,
  isTranslating = false,
}: TranslationPreviewModalProps) {
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  /** Texto traduzido editável por item (chave = targetLocale-field). */
  const [editedText, setEditedText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || previews.length === 0) return;
    const next: Record<string, string> = {};
    for (const p of previews) {
      for (const c of p.changes) {
        next[changeKey(c)] = c.translatedText;
      }
    }
    setEditedText(next);
    setSelectedChanges(new Set());
  }, [isOpen, previews]);

  if (!isOpen) return null;

  const allChanges = previews.flatMap((preview) => preview.changes);
  const totalChanges = allChanges.length;

  const handleToggleChange = (key: string) => {
    const next = new Set(selectedChanges);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedChanges(next);
  };

  const handleApproveSelected = () => {
    const approvedChanges: TranslationChange[] = allChanges
      .filter((change) => selectedChanges.has(changeKey(change)))
      .map((change) => ({
        ...change,
        translatedText: editedText[changeKey(change)] ?? change.translatedText,
        translationError: undefined,
      }));
    onApprove(approvedChanges);
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedChanges(new Set(allChanges.map((c) => changeKey(c))));
  };

  const handleDeselectAll = () => {
    setSelectedChanges(new Set());
  };

  const getLocaleName = (locale: string) => {
    switch (locale) {
      case 'pt-BR':
        return 'Português (Brasil)';
      case 'en':
        return 'English';
      case 'es':
        return 'Español';
      default:
        return locale;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revisar e editar traduções</h2>
            <p className="text-sm text-gray-600">
              {totalChanges} mudança{totalChanges !== 1 ? 's' : ''} para revisar. Ajuste o texto traduzido se
              necessário, marque as linhas e aplique.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isTranslating ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Traduzindo textos...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Selecionar todas
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Desmarcar todas
                </button>
              </div>

              {previews.map((preview) => (
                <div key={preview.locale} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">{getLocaleName(preview.locale)}</h3>

                  <div className="space-y-3">
                    {preview.changes.map((change) => {
                      const key = changeKey(change);
                      const isSelected = selectedChanges.has(key);

                      return (
                        <div key={key} className="rounded border border-gray-200 bg-white p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleChange(key)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              {change.field}
                            </span>
                          </div>

                          {change.translationError ? (
                            <div className="mb-2 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>{change.translationError}</span>
                            </div>
                          ) : null}

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-medium text-gray-700">Original (ES)</p>
                              <p className="rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900">
                                {change.originalText}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-medium text-gray-700">
                                Tradução ({change.targetLocale}) — editável
                              </p>
                              <textarea
                                value={editedText[key] ?? change.translatedText}
                                onChange={(e) =>
                                  setEditedText((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                rows={Math.min(12, Math.max(3, 1 + (change.originalText?.length || 0) / 80))}
                                className={`w-full resize-y rounded border p-2 text-sm text-gray-900 outline-none ring-blue-500 focus:ring-2 ${
                                  isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApproveSelected}
            disabled={selectedChanges.size === 0}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Aplicar {selectedChanges.size} tradução{selectedChanges.size !== 1 ? 'ões' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
