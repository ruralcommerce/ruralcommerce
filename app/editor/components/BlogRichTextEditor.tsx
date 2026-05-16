'use client';

import { useCallback, useEffect, useRef } from 'react';

import '../styles/quill-snow.css';

/** Quill UMD from `public/editor-vendor/quill.min.js` — avoids webpack resolving the `quill` npm package. */
type QuillConstructor = new (el: HTMLElement, options?: unknown) => QuillInstance;

let quillScriptLoad: Promise<void> | null = null;

function getWindowQuill(): QuillConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { Quill?: QuillConstructor }).Quill;
}

function ensureQuillScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (getWindowQuill()) return Promise.resolve();
  if (quillScriptLoad) return quillScriptLoad;
  quillScriptLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/editor-vendor/quill.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      quillScriptLoad = null;
      reject(new Error('Failed to load rich text editor (editor-vendor/quill.min.js).'));
    };
    document.head.appendChild(script);
  });
  return quillScriptLoad;
}

type QuillInstance = {
  root: { innerHTML: string };
  getSelection: (focus?: boolean) => { index: number; length?: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
  setSelection: (index: number, length?: number) => void;
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
};

type BlogRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onRequestImage: () => void;
  bindInsertImage: (fn: (url: string) => void) => void;
};

export function BlogRichTextEditor({ value, onChange, onRequestImage, bindInsertImage }: BlogRichTextEditorProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRequestImageRef = useRef(onRequestImage);
  onRequestImageRef.current = onRequestImage;

  const insertImageCb = useCallback((url: string) => {
    const q = quillRef.current;
    if (!q) return;
    const range = q.getSelection(true);
    const index = range ? range.index : Math.max(0, q.getLength() - 1);
    q.insertEmbed(index, 'image', url, 'user');
    q.setSelection(index + 1, 0);
  }, []);

  useEffect(() => {
    bindInsertImage(insertImageCb);
  }, [bindInsertImage, insertImageCb]);

  useEffect(() => {
    let cancelled = false;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const textChangeHandler = () => {
      const q = quillRef.current;
      if (q) onChangeRef.current(q.root.innerHTML);
    };

    void (async () => {
      try {
        await ensureQuillScript();
      } catch (err) {
        console.error(err);
        return;
      }
      const QuillCtor = getWindowQuill();
      if (!QuillCtor || cancelled || !wrapRef.current) return;

      wrapRef.current.innerHTML = '';
      const editorEl = document.createElement('div');
      wrapRef.current.appendChild(editorEl);

      const q = new QuillCtor(editorEl, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ align: [] }],
              ['link', 'image'],
              ['clean'],
            ],
            handlers: {
              image() {
                onRequestImageRef.current();
              },
            },
          },
          clipboard: { matchVisual: false },
        },
      });

      quillRef.current = q;
      q.clipboard.dangerouslyPasteHTML(value || '');
      q.on('text-change', textChangeHandler);
      bindInsertImage(insertImageCb);
    })();

    return () => {
      cancelled = true;
      const q = quillRef.current;
      if (q) {
        try {
          q.off('text-change', textChangeHandler);
        } catch {
          /* ignore */
        }
      }
      quillRef.current = null;
      wrap.innerHTML = '';
    };
    // Monta Quill uma vez; `value` inicial vem do closure. Sincronização posterior no efeito seguinte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindInsertImage, insertImageCb]);

  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const cur = q.root.innerHTML;
    if (cur === value) return;
    const sel = q.getSelection(true);
    const index = sel?.index;
    const length = sel?.length;
    q.clipboard.dangerouslyPasteHTML(value || '');
    if (typeof index === 'number') {
      try {
        q.setSelection(index, length ?? 0);
      } catch {
        /* ignore */
      }
    }
  }, [value]);

  return (
    <div
      ref={wrapRef}
      className="blog-rich-text-editor min-h-[220px] rounded border border-slate-300 bg-white [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-[14px] [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md"
    />
  );
}
