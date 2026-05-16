/** Props JSON que devem ser objeto (ex.: GeoJSON), não array. */
export const JSON_OBJECT_PROP_KEYS = new Set(['territoriesGeoJson', 'formCopyJson']);

/** Arrays JSON onde string vazia é válida (usa fallback no runtime). */
export const JSON_ARRAY_ALLOW_EMPTY = new Set(['statsJson']);

export function isInvalidJsonProp(key: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;

  if (key === 'territoriesGeoJson') {
    if (value.trim().length === 0) return false;
    try {
      const parsed = JSON.parse(value);
      return typeof parsed !== 'object' || parsed === null || Array.isArray(parsed);
    } catch {
      return true;
    }
  }

  if (!key.endsWith('Json')) return false;

  if (value.trim().length === 0) {
    if (JSON_ARRAY_ALLOW_EMPTY.has(key)) return false;
    return !JSON_OBJECT_PROP_KEYS.has(key);
  }

  try {
    const parsed = JSON.parse(value);
    if (JSON_OBJECT_PROP_KEYS.has(key)) {
      return typeof parsed !== 'object' || parsed === null || Array.isArray(parsed);
    }
    return !Array.isArray(parsed);
  } catch {
    return true;
  }
}

export function getJsonValidationMessage(propName: string, value: unknown): string | null {
  if (propName === 'territoriesGeoJson') {
    if (typeof value !== 'string' || value.trim().length === 0) return null;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return 'GeoJSON: esperado um objeto FeatureCollection (ex.: {"type":"FeatureCollection",...}).';
      }
      return null;
    } catch {
      return 'JSON invalido. Verifique virgulas, aspas e chaves.';
    }
  }

  if (!propName.endsWith('Json') || typeof value !== 'string') {
    return null;
  }

  if (value.trim().length === 0) {
    if (JSON_ARRAY_ALLOW_EMPTY.has(propName)) return null;
    if (JSON_OBJECT_PROP_KEYS.has(propName)) return null;
    return 'Campo JSON vazio. Use ao menos [] para lista vazia.';
  }

  try {
    const parsed = JSON.parse(value);
    if (JSON_OBJECT_PROP_KEYS.has(propName)) {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return 'JSON valido, mas o formato esperado e um objeto (ex.: {...}).';
      }
      return null;
    }
    if (!Array.isArray(parsed)) {
      return 'JSON valido, mas o formato esperado e um array (ex.: [...]).';
    }
    return null;
  } catch {
    return 'JSON invalido. Verifique virgulas, aspas e colchetes.';
  }
}
