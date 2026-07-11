'use client';

import { useEffect, useState } from 'react';
import { getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

const copy: Record<
  ProjectLocaleKey,
  {
    title: string;
    text: string;
    enable: string;
    enabled: string;
    unsupported: string;
    denied: string;
    error: string;
  }
> = {
  es: {
    title: 'Notificaciones del proyecto',
    text: 'Recibe avisos del programa en este dispositivo (push web). Complementa el e-mail y WhatsApp.',
    enable: 'Activar notificaciones',
    enabled: 'Notificaciones activadas en este dispositivo.',
    unsupported: 'Tu navegador no admite notificaciones push.',
    denied: 'Permiso denegado. Actívalo en la configuración del navegador.',
    error: 'No se pudieron activar las notificaciones.',
  },
  'pt-BR': {
    title: 'Notificações do projeto',
    text: 'Receba avisos do programa neste dispositivo (push web). Complementa e-mail e WhatsApp.',
    enable: 'Ativar notificações',
    enabled: 'Notificações ativadas neste dispositivo.',
    unsupported: 'Seu navegador não suporta notificações push.',
    denied: 'Permissão negada. Ative nas configurações do navegador.',
    error: 'Não foi possível ativar as notificações.',
  },
  en: {
    title: 'Project notifications',
    text: 'Receive program alerts on this device (web push). Complements email and WhatsApp.',
    enable: 'Enable notifications',
    enabled: 'Notifications enabled on this device.',
    unsupported: 'Your browser does not support web push.',
    denied: 'Permission denied. Enable it in browser settings.',
    error: 'Could not enable notifications.',
  },
};

export function ProjectPushOptIn({
  locale,
  email,
  password,
  marketingConsent,
}: {
  locale: string;
  email: string;
  password: string;
  marketingConsent?: boolean;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [status, setStatus] = useState<'idle' | 'enabled' | 'loading' | 'unsupported'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
    }
  }, []);

  if (!marketingConsent) return null;

  const handleEnable = async () => {
    setError('');
    setStatus('loading');

    try {
      const vapidRes = await fetch('/api/projeto/push/vapid');
      const vapidPayload = await vapidRes.json();
      if (!vapidPayload.configured || !vapidPayload.publicKey) {
        setStatus('idle');
        setError(t.error);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('idle');
        setError(t.denied);
        return;
      }

      const registration = await navigator.serviceWorker.register('/rc-push-sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPayload.publicKey),
      });

      const response = await fetch('/api/projeto/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          locale: localeKey,
          subscription: subscription.toJSON(),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setStatus('idle');
        setError(t.error);
        return;
      }

      setStatus('enabled');
    } catch {
      setStatus('idle');
      setError(t.error);
    }
  };

  if (status === 'unsupported') {
    return (
      <div className="mt-4 rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-4 text-sm text-[#2F3336]/70">
        {t.unsupported}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{t.title}</p>
      <p className="mt-1 text-sm text-[#2F3336]/80">{t.text}</p>
      {status === 'enabled' ? (
        <p className="mt-2 text-sm font-medium text-[#1D6359]">{t.enabled}</p>
      ) : (
        <button
          type="button"
          onClick={handleEnable}
          disabled={status === 'loading' || !password}
          className="mt-3 inline-flex rounded-full border border-[#D9E3EC] bg-white px-4 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
        >
          {status === 'loading' ? '...' : t.enable}
        </button>
      )}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
