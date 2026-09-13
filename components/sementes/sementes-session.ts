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
  const data = (await response.json().catch(() => ({}))) as T & { message?: string; ok?: boolean };
  if (!response.ok) {
    throw new Error(data.message || 'Não rolou. Tenta de novo.');
  }
  return data;
}
