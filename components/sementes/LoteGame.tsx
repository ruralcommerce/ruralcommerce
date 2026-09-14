'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LoteKind, LoteView } from '@/lib/lote-types';
import { fromCents, upgradeCost } from '@/lib/lote-sim';
import { LoteWorld, type LotePhase } from '@/components/sementes/LoteWorld';
import { readSementesToken, sementesJson, useSementesLock } from '@/components/sementes/sementes-session';
import '@/components/sementes/lote.css';

const TOKEN_KEY = 'rc_lote_token';

function bump(value: string, delta: number, min: number) {
  const next = Number(String(value).replace(',', '.')) + delta;
  if (!Number.isFinite(next)) return String(min);
  return String(Math.max(min, Math.round(next * 100) / 100));
}

function talk(phase: LotePhase, playing: boolean, error: string, log: string) {
  if (error) return error;
  if (playing) return log;
  if (phase === 'empty') return 'Terreno vazio. Toca o pedaço de terra.';
  if (phase === 'pick') return 'Levanta a banca ou a tenda.';
  if (phase === 'sign') return 'Escreve o nome na placa.';
    return 'Toca a bandeira vermelha e abre as portas.';
}

export function LoteGame({ locale }: { locale: string }) {
  const [lote, setLote] = useState<LoteView | null>(null);
  const [token, setToken] = useState('');
  const [phase, setPhase] = useState<LotePhase>('empty');
  const [kind, setKind] = useState<LoteKind>('produto');
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [price, setPrice] = useState('10');
  const [cost, setCost] = useState('4');
  const [cash, setCash] = useState('200');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shop, setShop] = useState(false);
  const [you, setYou] = useState({ col: 3, row: 4 });
  const [pops, setPops] = useState<{ id: number; col: number; row: number; text: string }[]>([]);
  const [seedToken, setSeedToken] = useState('');
  const [seedKind, setSeedKind] = useState<LoteKind | null>(null);
  useSementesLock();

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY) || '';
    if (saved) void load(saved);
    const existing = readSementesToken();
    if (!existing) return;
    setSeedToken(existing);
    void sementesJson<{ seed: { name: string; path?: string } }>('/api/sementes/draft', { token: existing })
      .then((data) => {
        setName((value) => value || data.seed.name || '');
        if (data.seed.path === 'servico' || data.seed.path === 'produto') {
          setKind(data.seed.path);
          setSeedKind(data.seed.path);
        }
      })
      .catch(() => undefined);
  }, []);

  async function load(nextToken: string) {
    try {
      const data = await sementesJson<{ token: string; lote: LoteView }>('/api/sementes/lote', { token: nextToken });
      window.localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setLote(data.lote);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }

  function popAt(col: number, row: number, text: string) {
    const id = Date.now() + Math.random();
    setPops((current) => [...current, { id, col, row, text }]);
    window.setTimeout(() => setPops((current) => current.filter((item) => item.id !== id)), 1100);
  }

  async function start() {
    const product = business.trim();
    if (product.length < 3) {
      setError('Escreve o nome na placa.');
      setPhase('sign');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ token: string; lote: LoteView }>('/api/sementes/lote', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          name,
          business: product,
          product,
          kind,
          price: Number(price.replace(',', '.')),
          cost: Number(cost.replace(',', '.')),
          cash: Number(cash.replace(',', '.')),
          seedToken: seedToken || undefined,
        }),
      });
      window.localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setLote(data.lote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu para abrir o lote.');
    } finally {
      setBusy(false);
    }
  }

  async function act(
    nextAct: 'produce' | 'sell' | 'upgrade-stall' | 'upgrade-tools' | 'upgrade-sign' | 'rest',
    col: number,
    row: number
  ) {
    if (!token || busy) return;
    setYou({ col, row });
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ lote: LoteView }>('/api/sementes/lote', {
        method: 'POST',
        token,
        body: JSON.stringify({ action: 'act', act: nextAct }),
      });
      setLote(data.lote);
      if (nextAct === 'produce') popAt(col, row, '+un');
      if (nextAct === 'sell') popAt(col, row, '+R$');
      if (nextAct.startsWith('upgrade')) setShop(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não rolou.');
    } finally {
      setBusy(false);
    }
  }

  const playing = Boolean(lote);
  const stallPrice = lote ? upgradeCost(lote.stallLevel, 8000) : 0;
  const toolsPrice = lote ? upgradeCost(lote.toolsLevel, 7000) : 0;
  const signPrice = lote ? upgradeCost(lote.signLevel, 5000) : 0;
  const worldPhase: LotePhase = playing ? 'play' : phase;
  const speech = talk(worldPhase, playing, error, lote?.log || '');

  return (
    <div className="lote-root">
      <header className="lote-hud">
        <div className="lote-hud-brand">
          <span>{playing ? `Dia ${lote?.day}` : 'Lote vazio'}</span>
          <strong>{playing ? lote?.business : business || '—'}</strong>
        </div>
        {lote ? (
          <div className="lote-stats">
            <div className="lote-stat">
              <b>{fromCents(lote.cashCents)}</b>
              <small>caixa</small>
            </div>
            <div className="lote-stat">
              <b>{lote.stock}</b>
              <small>estoque</small>
            </div>
          </div>
        ) : null}
      </header>

      <div className="lote-stage">
        <LoteWorld
          phase={worldPhase}
          kind={kind}
          stallLevel={lote?.stallLevel || 0}
          stock={lote?.stock || 0}
          you={you}
          pops={pops}
          speech={speech}
          onEmpty={() => {
            setYou({ col: 3, row: 4 });
            setError('');
            if (seedKind) {
              setKind(seedKind);
              setPhase('sign');
              return;
            }
            setPhase('pick');
          }}
          onPick={(next) => {
            setKind(next);
            setYou({ col: 3, row: 4 });
            setPhase('sign');
          }}
          onProduce={() => playing && void act('produce', 3, 2)}
          onSell={() => playing && void act('sell', 6, 4)}
          onStall={() => {
            setYou({ col: 5, row: 2 });
            if (playing) {
              setShop(true);
              return;
            }
            if (phase === 'price' && !busy) void start();
          }}
          onRest={() => playing && void act('rest', 2, 1)}
        >
          {!playing && phase === 'sign' ? (
            <form
              className="lote-on-stall lote-sign"
              onSubmit={(event) => {
                event.preventDefault();
                if (business.trim().length >= 3) {
                  setError('');
                  setPhase('price');
                } else {
                  setError('Nome curto demais.');
                }
              }}
            >
              <input
                autoFocus
                maxLength={28}
                placeholder="nome da banca"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              />
              <button type="submit" className="lote-nail" aria-label="Confirmar nome">
                ✓
              </button>
            </form>
          ) : null}

          {!playing && phase === 'price' ? (
            <>
              <div className="lote-on-plot lote-coins">
                <div className="lote-step">
                  <span>cobra</span>
                  <button type="button" onClick={() => setPrice(bump(price, -1, 1))}>
                    −
                  </button>
                  <b>{price}</b>
                  <button type="button" onClick={() => setPrice(bump(price, 1, 1))}>
                    +
                  </button>
                </div>
                <div className="lote-step">
                  <span>custa</span>
                  <button type="button" onClick={() => setCost(bump(cost, -1, 0))}>
                    −
                  </button>
                  <b>{cost}</b>
                  <button type="button" onClick={() => setCost(bump(cost, 1, 0))}>
                    +
                  </button>
                </div>
                <div className="lote-step">
                  <span>caixa</span>
                  <button type="button" onClick={() => setCash(bump(cash, -50, 0))}>
                    −
                  </button>
                  <b>{cash}</b>
                  <button type="button" onClick={() => setCash(bump(cash, 50, 0))}>
                    +
                  </button>
                </div>
              </div>
              <button type="button" className="lote-flag" disabled={busy} onClick={() => void start()}>
                Abre
              </button>
            </>
          ) : null}
        </LoteWorld>
      </div>

      {lote && shop ? (
        <div className="lote-sheet">
          <h2>Melhorar o lote</h2>
          <button type="button" className="lote-up" disabled={lote.stallLevel >= 3} onClick={() => void act('upgrade-stall', 5, 2)}>
            <span>Banca maior</span>
            <small>{lote.stallLevel >= 3 ? 'máx' : fromCents(stallPrice)}</small>
          </button>
          <button type="button" className="lote-up" disabled={lote.toolsLevel >= 3} onClick={() => void act('upgrade-tools', 3, 2)}>
            <span>Ferramenta</span>
            <small>{lote.toolsLevel >= 3 ? 'máx' : fromCents(toolsPrice)}</small>
          </button>
          <button type="button" className="lote-up" disabled={lote.signLevel >= 3} onClick={() => void act('upgrade-sign', 6, 4)}>
            <span>Placa na estrada</span>
            <small>{lote.signLevel >= 3 ? 'máx' : fromCents(signPrice)}</small>
          </button>
          <button type="button" className="lote-up" onClick={() => setShop(false)}>
            <span>Fechar</span>
            <small>mapa</small>
          </button>
        </div>
      ) : null}

      {!playing ? (
        <Link href={`/${locale}/sementes`} className="lote-quiet">
          Oficina de 15 min
        </Link>
      ) : null}
    </div>
  );
}
