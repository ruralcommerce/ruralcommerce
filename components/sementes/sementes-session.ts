import { useEffect } from 'react';

const TOKEN_KEY = 'rc_sementes_token';
const DEVICE_KEY = 'rc_sementes_device';

export function readSementesToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(TOKEN_KEY) || '';
}

export function writeSementesToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearSementesToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function readSementesDevice() {
  if (typeof window === 'undefined') return '';
  let value = window.localStorage.getItem(DEVICE_KEY) || '';
  if (!value) {
    value = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(DEVICE_KEY, value);
  }
  return value;
}

export function useSementesLock(mode: 'lock' | 'fill' = 'lock') {
  useEffect(() => {
    document.documentElement.classList.add('sementes-lock');
    document.body.classList.add('sementes-lock');
    if (mode === 'fill') {
      document.documentElement.classList.add('sementes-fill');
      document.body.classList.add('sementes-fill');
    }
    return () => {
      document.documentElement.classList.remove('sementes-lock', 'sementes-fill');
      document.body.classList.remove('sementes-lock', 'sementes-fill');
    };
  }, [mode]);
}

function statusMessage(status: number) {
  if (status === 401) return 'Sessão não encontrada.';
  if (status === 413) return 'SEMENTES_VIDEO_HEAVY';
  if (status === 502 || status === 504) return 'O envio caiu no caminho. Tenta de novo.';
  if (status === 503) return 'O armazém de vídeo ainda não está ligado neste servidor.';
  if (status === 500) return 'O servidor travou no vídeo. Tenta de novo, mais curto.';
  return 'Não rolou. Tenta de novo.';
}

export async function sementesJson<T>(
  url: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.token) headers.set('authorization', `Bearer ${init.token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const response = await fetch(url, { ...init, headers });
  const text = await response.text().catch(() => '');
  let data = {} as T & { message?: string; ok?: boolean };
  if (text) {
    try {
      data = JSON.parse(text) as T & { message?: string; ok?: boolean };
    } catch {
      data = {} as T & { message?: string; ok?: boolean };
    }
  }
  if (!response.ok) {
    if (response.status === 413 || /413|too large|entity too large/i.test(text)) {
      throw new Error('SEMENTES_VIDEO_HEAVY');
    }
    throw new Error(data.message || statusMessage(response.status));
  }
  return data;
}
