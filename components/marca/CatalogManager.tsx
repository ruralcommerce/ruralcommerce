'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { MarcaImage } from '@/lib/marca/types';
import { MarcaButton, MarcaInput, MarcaPanel, MarcaTextarea } from './MarcaShell';

export function CatalogManager() {
  const [images, setImages] = useState<MarcaImage[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [alt, setAlt] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [moodColor, setMoodColor] = useState('#071F5E');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/marca/catalog');
    if (!res.ok) return;
    const data = (await res.json()) as { images: MarcaImage[]; suggestedTags: string[] };
    setImages(data.images);
    setSuggestedTags(data.suggestedTags || []);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setAlt('');
    setTagsText('');
    setMoodColor('#071F5E');
    setFile(null);
    setEditingId(null);
  }

  function startEdit(img: MarcaImage) {
    setEditingId(img.id);
    setAlt(img.alt);
    setTagsText(img.tags.join(', '));
    setMoodColor(img.moodColor || '#071F5E');
    setFile(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (file) {
        const form = new FormData();
        form.set('file', file);
        form.set('alt', alt);
        form.set('tags', tagsText);
        form.set('moodColor', moodColor);
        if (editingId) form.set('id', editingId);
        const res = await fetch('/api/marca/catalog', { method: 'POST', body: form });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setMessage(err.error || 'Error al subir');
          return;
        }
      } else {
        const res = await fetch(editingId ? `/api/marca/catalog/${editingId}` : '/api/marca/catalog', {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alt,
            tags: tagsText.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean),
            moodColor,
            src: editingId ? undefined : '',
          }),
        });
        if (!res.ok) {
          setMessage('Error al guardar');
          return;
        }
      }
      resetForm();
      setMessage(editingId ? 'Imagen actualizada' : 'Imagen agregada al catálogo');
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(img: MarcaImage) {
    await fetch(`/api/marca/catalog/${img.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: img.active === false }),
    });
    await load();
  }

  async function remove(img: MarcaImage) {
    if (!window.confirm(`¿Eliminar "${img.alt}" del catálogo?`)) return;
    await fetch(`/api/marca/catalog/${img.id}`, { method: 'DELETE' });
    if (editingId === img.id) resetForm();
    await load();
  }

  function addSuggested(tag: string) {
    const current = tagsText
      .split(/[,;\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (current.some((t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase())) return;
    setTagsText([...current, tag].join(', '));
  }

  return (
    <div className="space-y-6">
      <MarcaPanel>
        <h2 className="text-lg font-bold text-[var(--rc-primary)]">
          {editingId ? 'Editar imagen' : 'Subir imagen al catálogo'}
        </h2>
        <p className="mt-1 text-sm text-[var(--rc-text)]/65">
          Las tags son invisibles para el participante. Sube fotos del Drive o crea un color de mood.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <MarcaInput
            placeholder="Nombre visible (ej. Mercado al atardecer)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            required
          />
          <MarcaTextarea
            placeholder="Tags invisibles, separadas por coma"
            rows={2}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {suggestedTags.slice(0, 12).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addSuggested(tag)}
                className="rounded-md bg-[var(--rc-bg)] px-2.5 py-1 text-xs font-medium text-[var(--rc-primary)]"
              >
                + {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-[var(--rc-primary)]">
              Color mood
              <input
                type="color"
                value={moodColor}
                onChange={(e) => setMoodColor(e.target.value)}
                className="ml-2 h-9 w-12 cursor-pointer rounded border border-[var(--rc-primary)]/15 bg-white"
              />
            </label>
            <label className="text-sm font-semibold text-[var(--rc-primary)]">
              Archivo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="ml-2 block text-xs font-normal"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <MarcaButton type="submit" disabled={busy}>
              {busy ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar al catálogo'}
            </MarcaButton>
            {editingId ? (
              <MarcaButton type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </MarcaButton>
            ) : null}
          </div>
          {message ? <p className="text-sm text-[var(--rc-accent)]">{message}</p> : null}
        </form>
      </MarcaPanel>

      <MarcaPanel>
        <h2 className="text-lg font-bold text-[var(--rc-primary)]">Catálogo ({images.length})</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <li
              key={img.id}
              className={`overflow-hidden rounded-xl border border-[var(--rc-primary)]/10 ${
                img.active === false ? 'opacity-50' : ''
              }`}
            >
              <div className="relative aspect-[4/3] bg-[var(--rc-bg)]">
                {img.src ? (
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="320px" />
                ) : (
                  <div className="absolute inset-0" style={{ background: img.moodColor || '#071F5E' }} />
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="font-semibold text-[var(--rc-primary)]">{img.alt}</p>
                <p className="text-xs leading-5 text-[var(--rc-text)]/60">{img.tags.join(' · ') || 'Sin tags'}</p>
                <div className="flex flex-wrap gap-2">
                  <MarcaButton variant="ghost" className="min-h-9 px-3 text-xs" onClick={() => startEdit(img)}>
                    Editar
                  </MarcaButton>
                  <MarcaButton variant="ghost" className="min-h-9 px-3 text-xs" onClick={() => void toggleActive(img)}>
                    {img.active === false ? 'Activar' : 'Desactivar'}
                  </MarcaButton>
                  <MarcaButton variant="ghost" className="min-h-9 px-3 text-xs" onClick={() => void remove(img)}>
                    Eliminar
                  </MarcaButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </MarcaPanel>
    </div>
  );
}
