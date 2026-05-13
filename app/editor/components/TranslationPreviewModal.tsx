'use client';

/**
 * TranslationPreviewModal - Modal para preview e aprovação de traduções
 */

import { useState } from 'react';
import { TranslationPreview, TranslationChange } from '@/lib/translation-utils';
import { X, Check, X as XIcon, Loader2 } from 'lucide-react';

interface TranslationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previews: TranslationPreview[];
  onApprove: (approvedChanges: TranslationChange[]) => void;
  isTranslating?: boolean;
}

export function TranslationPreviewModal({
  isOpen,
  onClose,
  previews,
  onApprove,
  isTranslating = false,
}: TranslationPreviewModalProps) {
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const allChanges = previews.flatMap(preview => preview.changes);
  const totalChanges = allChanges.length;

  const handleToggleChange = (changeKey: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(changeKey)) {
      newSelected.delete(changeKey);
    } else {
      newSelected.add(changeKey);
    }
    setSelectedChanges(newSelected);
  };

  const handleApproveSelected = () => {
    const approvedChanges = allChanges.filter(change =>
      selectedChanges.has(`${change.targetLocale}-${change.field}`)
    );
    onApprove(approvedChanges);
    onClose();
  };

  const handleSelectAll = () => {
    const allKeys = allChanges.map(change => `${change.targetLocale}-${change.field}`);
    setSelectedChanges(new Set(allKeys));
  };

  const handleDeselectAll = () => {
    setSelectedChanges(new Set());
  };

  const getLocaleName = (locale: string) => {
    switch (locale) {
      case 'pt-BR': return 'Português (Brasil)';
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return locale;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Revisar Traduções Automáticas
            </h2>
            <p className="text-sm text-gray-600">
              {totalChanges} mudança{totalChanges !== 1 ? 's' : ''} detectada{totalChanges !== 1 ? 's' : ''}.
              Selecione quais traduções deseja aplicar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isTranslating ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Traduzindo textos...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bulk Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Selecionar Todas
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Desmarcar Todas
                </button>
              </div>

              {/* Translation Previews */}
              {previews.map((preview) => (
                <div key={preview.locale} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-medium text-gray-900">
                    {getLocaleName(preview.locale)}
                  </h3>

                  <div className="space-y-3">
                    {preview.changes.map((change) => {
                      const changeKey = `${change.targetLocale}-${change.field}`;
                      const isSelected = selectedChanges.has(changeKey);

                      return (
                        <div key={changeKey} className="rounded border border-gray-200 bg-white p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleChange(changeKey)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {change.field}
                            </span>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Original (ES):</p>
                              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                                {change.originalText}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">
                                Tradução ({change.targetLocale.toUpperCase()}):
                              </p>
                              <p className={`text-sm p-2 rounded border ${
                                isSelected ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-gray-200 text-gray-900'
                              }`}>
                                {change.translatedText}
                              </p>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleApproveSelected}
            disabled={selectedChanges.size === 0}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Aplicar {selectedChanges.size} Tradução{selectedChanges.size !== 1 ? 'ões' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}