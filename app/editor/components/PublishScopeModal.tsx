'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EDITOR_PAGES } from '@/lib/editor-pages';
import { locales } from '@/i18n/request';
import { X } from 'lucide-react';

export type PublishScopeSelection = {
  pageSlugs: string[];
  locales: string[];
};

interface PublishScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageSlug: string;
  currentLocale: string;
  /** Retorna true se tudo OK (ou parcial aceitável); false cancela fechamento pós-erro só se quiser */
  onConfirm: (scope: PublishScopeSelection) => Promise<void>;
  isPublishing?: boolean;
}

const LOCALE_LABEL: Record<string, string> = {
  es: 'Español (ES)',
  'pt-BR': 'Português (PT-BR)',
  en: 'English (EN)',
};

export function PublishScopeModal({
  isOpen,
  onClose,
  currentPageSlug,
  currentLocale,
  onConfirm,
  isPublishing = false,
}: PublishScopeModalProps) {
  const [allPages, setAllPages] = useState(false);
  const [allLocales, setAllLocales] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [selectedLocales, setSelectedLocales] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setAllPages(false);
    setAllLocales(false);
    setSelectedPages(new Set([currentPageSlug]));
    setSelectedLocales(new Set([currentLocale]));
  }, [isOpen, currentPageSlug, currentLocale]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isPublishing, onClose]);

  if (!isOpen) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isPublishing) {
      onClose();
    }
  };

  const togglePage = (slug: string) => {
    setAllPages(false);
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleLocale = (loc: string) => {
    setAllLocales(false);
    setSelectedLocales((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  };

  const pageSlugs = allPages ? EDITOR_PAGES.map((p) => p.slug) : Array.from(selectedPages);
  const localeList = allLocales ? [...locales] : Array.from(selectedLocales);
  const totalPairs = Math.max(0, pageSlugs.length) * Math.max(0, localeList.length);

  const handleConfirm = async () => {
    if (pageSlugs.length === 0 || localeList.length === 0) {
      toast.error('Seleção incompleta', {
        description: 'Escolha pelo menos uma página e um idioma (ou use "Todas").',
      });
      return;
    }
    await onConfirm({ pageSlugs, locales: localeList });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-scope-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="publish-scope-title" className="text-lg font-semibold text-slate-900">
              Publicar no site e no Git
            </h2>
            <p className="text-sm text-slate-600">
              Escolha quais páginas e idiomas recebem status <strong>publicado</strong> agora.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <label className="flex cursor-pointer items-center gap-2 border-b border-slate-100 pb-2 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={allPages}
                disabled={isPublishing}
                onChange={(e) => {
                  const on = e.target.checked;
                  setAllPages(on);
                  if (on) {
                    setSelectedPages(new Set(EDITOR_PAGES.map((p) => p.slug)));
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              Todas as páginas ({EDITOR_PAGES.length})
            </label>
            <div className="mt-2 grid gap-1.5 pl-1">
              {EDITOR_PAGES.map((p) => (
                <label
                  key={p.slug}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
                    allPages ? 'text-slate-400' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allPages || selectedPages.has(p.slug)}
                    disabled={isPublishing || allPages}
                    onChange={() => togglePage(p.slug)}
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <label className="flex cursor-pointer items-center gap-2 border-b border-slate-100 pb-2 font-medium text-slate-800">
              <input
                type="checkbox"
                checked={allLocales}
                disabled={isPublishing}
                onChange={(e) => {
                  const on = e.target.checked;
                  setAllLocales(on);
                  if (on) {
                    setSelectedLocales(new Set(locales as readonly string[]));
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              Todos os idiomas ({locales.length})
            </label>
            <div className="mt-2 grid gap-1.5 pl-1">
              {locales.map((loc) => (
                <label
                  key={loc}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
                    allLocales ? 'text-slate-400' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allLocales || selectedLocales.has(loc)}
                    disabled={isPublishing || allLocales}
                    onChange={() => toggleLocale(loc)}
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  {LOCALE_LABEL[loc] ?? loc}
                </label>
              ))}
            </div>
          </section>

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Serão enviadas <strong>{totalPairs}</strong> publicação{totalPairs !== 1 ? 'ões' : ''} (uma por arquivo de
            layout). A página aberta no editor usa o conteúdo atual; as outras combinações usam o que já está salvo no
            servidor. Se faltar ficheiro para um par, o sistema tenta criar uma cópia a partir de outro idioma do mesmo
            slug e em seguida publicar.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPublishing || totalPairs === 0}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : `Confirmar (${totalPairs})`}
          </button>
        </div>
      </div>
    </div>
  );
}
