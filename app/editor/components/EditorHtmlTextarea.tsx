'use client';

/**
 * Campo HTML com barra rápida (negrito, itálico, link, lista) — referência UX Elementor.
 */

import { Bold, Italic, Link2, List } from 'lucide-react';
import { useCallback, useRef } from 'react';

export function EditorHtmlTextarea({
  value,
  onChange,
  rows = 14,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyEdit = useCallback(
    (next: string, selStart: number, selEnd: number) => {
      onChange(next);
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      });
    },
    [onChange]
  );

  const wrapTag = useCallback(
    (tag: string) => {
      const el = ref.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const open = `<${tag}>`;
      const close = `</${tag}>`;
      const selected = value.slice(start, end);
      const inner = selected.length ? selected : 'texto';
      const next = value.slice(0, start) + open + inner + close + value.slice(end);
      const caretStart = start + open.length;
      const caretEnd = caretStart + inner.length;
      applyEdit(next, caretStart, caretEnd);
    },
    [value, applyEdit]
  );

  const insertLink = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const label = selected.length ? selected : 'texto';
    const href = typeof window !== 'undefined' ? window.prompt('URL do link (https://…)', 'https://') : null;
    if (href === null) return;
    const safeHref = href.trim() || '#';
    const snippet = `<a href="${safeHref}">${label}</a>`;
    const next = value.slice(0, start) + snippet + value.slice(end);
    const pos = start + snippet.length;
    applyEdit(next, pos, pos);
  }, [value, applyEdit]);

  const insertUl = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const block = `<ul>\n  <li>Item</li>\n</ul>\n`;
    const next = value.slice(0, start) + block + value.slice(start);
    const pos = start + block.length;
    applyEdit(next, pos, pos);
  }, [value, applyEdit]);

  const btnClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-600 transition hover:border-slate-200 hover:bg-white hover:text-violet-700 active:scale-[0.98]';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/80 px-2 py-1.5"
        role="toolbar"
        aria-label="Formatação HTML rápida"
      >
        <button type="button" className={btnClass} onClick={() => wrapTag('strong')} title="Negrito (&lt;strong&gt;)">
          <Bold className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
        <button type="button" className={btnClass} onClick={() => wrapTag('em')} title="Itálico (&lt;em&gt;)">
          <Italic className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
        <button type="button" className={btnClass} onClick={insertLink} title="Link (&lt;a&gt;)">
          <Link2 className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
        <button type="button" className={btnClass} onClick={insertUl} title="Lista (&lt;ul&gt;)">
          <List className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full resize-y border-0 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-900 outline-none focus:ring-2 focus:ring-inset focus:ring-violet-200/80"
      />
    </div>
  );
}
