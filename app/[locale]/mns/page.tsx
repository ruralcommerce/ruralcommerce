'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MNS_COURSE, MNS_FICHAS } from '@/lib/mns/content';
import '@/components/mns/mns.css';

export default function MnsHomePage() {
  const params = useParams();
  const locale = String(params.locale || 'es');
  const router = useRouter();
  const [code, setCode] = useState('');

  function enter(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/${locale}/mns/${encodeURIComponent(cleaned)}`);
  }

  return (
    <div className="mns-app">
      <header className="mns-header">
        <Link href={`/${locale}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-branco.png" alt="Rural Commerce" />
        </Link>
        <span className="mns-chip">MNS Internacional</span>
      </header>

      <div className="mns-welcome">
        <p className="mns-eyebrow">{MNS_COURSE.edition}</p>
        <h1>{MNS_COURSE.name}</h1>
        <p className="mns-lead">{MNS_COURSE.market}</p>
        <p className="mns-map-note">{MNS_COURSE.mapNote}</p>

        <form className="mns-card" style={{ marginTop: '1.25rem' }} onSubmit={enter}>
          <label className="mns-label" htmlFor="mns-code">
            Código de la sala
          </label>
          <input
            id="mns-code"
            className="mns-input"
            style={{ marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej. A3K9MP"
            autoCapitalize="characters"
            autoCorrect="off"
          />
          <button type="submit" className="mns-btn mns-btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Entrar
          </button>
        </form>

        <div className="mns-ficha-list">
          {MNS_FICHAS.map((f) => (
            <div key={f.id} className="mns-ficha-item">
              <div className="mns-ficha-num">{f.number}</div>
              <div>
                <strong>{f.title}</strong>
                <small>
                  Día {f.day} · {f.subtitle}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
