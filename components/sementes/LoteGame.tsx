'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LoteKind, LoteView } from '@/lib/lote-types';
import { fromCents, upgradeCost } from '@/lib/lote-sim';
import { LoteWorld } from '@/components/sementes/LoteWorld';
import { readSementesToken, sementesJson, useSementesLock } from '@/components/sementes/sementes-session';
import '@/components/sementes/lote.css';

const TOKEN_KEY = 'rc_lote_token';

type SeedHint = { name: string; product: string; kind: LoteKind };

export function LoteGame({ locale }: { locale: string }) {
  const [lote, setLote] = useState<LoteView | null>(null);
  const [token, setToken] = useState('');
  const [boot, setBoot] = useState(0);
  const [kind, setKind] = useState<LoteKind>('produto');
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('10');
  const [cost, setCost] = useState('4');
  const [cash, setCash] = useState('200');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shop, setShop] = useState(false);
  const [you, setYou] = useState({ col: 3, row: 4 });
  const [pops, setPops] = useState<{ id: number; col: number; row: number; text: string }[]>([]);
  const [seedHint, setSeedHint] = useState<SeedHint | null>(null);
  useSementesLock();

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY) || '';
    if (saved) void load(saved);
    const seedToken = readSementesToken();
    if (!seedToken) return;
    void sementesJson<{ seed: { name: string; solution: string; problem: string; path?: LoteKind } }>('/api/sementes/draft', {
      token: seedToken,
    })
      .then((data) => {
        const next = {
          name: data.seed.name || '',
          product: data.seed.solution || data.seed.problem || '',
          kind: data.seed.path === 'servico' ? 'servico' : 'produto',
        } as SeedHint;
        setSeedHint(next);
        setName((value) => value || next.name);
        setProduct((value) => value || next.product);
        setKind(next.kind);
        setBusiness((value) => value || next.product.slice(0, 32));
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
    window.setTimeout(() => {
      setPops((current) => current.filter((item) => item.id !== id));
    }, 1100);
  }

  async function start() {
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ token: string; lote: LoteView }>('/api/sementes/lote', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          name,
          business,
          product,
          kind,
          price: Number(price.replace(',', '.')),
          cost: Number(cost.replace(',', '.')),
          cash: Number(cash.replace(',', '.')),
          seedToken: readSementesToken() || undefined,
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

  async function act(nextAct: 'produce' | 'sell' | 'upgrade-stall' | 'upgrade-tools' | 'upgrade-sign' | 'rest', col: number, row: number) {
    if (!token || busy) return;
    setYou({ col, row });
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ lote: LoteView; message?: string }>('/api/sementes/lote', {
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

  if (!lote) {
    return (
      <div className="lote-root">
        <div className="lote-boot">
          <p className="lote-hud-brand">
            <span>Rural Commerce</span>
          </p>
          <div className="lote-boot-card">
            {boot === 0 ? (
              <>
                <h1>Teu lote.</h1>
                <p>
                  Não é pergunta. É o negócio visto de cima — como um SimCity do sítio. Os preços são os teus, em reais.
                  Produz, vende, melhora.
                </p>
                {seedHint?.product ? (
                  <p>Achei tua semente: {seedHint.product}</p>
                ) : null}
                <button type="button" className="lote-go" onClick={() => setBoot(1)}>
                  Entrar no terreno
                </button>
                <Link href={`/${locale}/sementes`} className="lote-quiet">
                  Voltar à oficina de 15 min
                </Link>
              </>
            ) : null}
            {boot === 1 ? (
              <>
                <h1>O que nasce aqui?</h1>
                <p>Toca no tipo. A banca muda.</p>
                <div className="lote-kinds">
                  <button
                    type="button"
                    className="lote-kind"
                    onClick={() => {
                      setKind('produto');
                      setBoot(2);
                    }}
                  >
                    Produto
                    <small>faz, leva, prova</small>
                  </button>
                  <button
                    type="button"
                    className="lote-kind"
                    onClick={() => {
                      setKind('servico');
                      setBoot(2);
                    }}
                  >
                    Serviço
                    <small>visita, faz por alguém</small>
                  </button>
                </div>
              </>
            ) : null}
            {boot === 2 ? (
              <>
                <h1>O que o lote vende?</h1>
                <p>O nome real da ideia. Não apelido inventado.</p>
                <input className="lote-field" placeholder="Ex.: snack de goiaba do sítio" value={product} onChange={(e) => setProduct(e.target.value)} />
                <input className="lote-field" placeholder="Nome do negócio (opcional)" value={business} onChange={(e) => setBusiness(e.target.value)} />
                <input className="lote-field" placeholder="Teu nome (só aqui)" value={name} onChange={(e) => setName(e.target.value)} />
                <button type="button" className="lote-go" disabled={product.trim().length < 3} onClick={() => setBoot(3)}>
                  Seguir
                </button>
              </>
            ) : null}
            {boot === 3 ? (
              <>
                <h1>Números reais.</h1>
                <p>Preço que você cobra. Custo para fazer uma. Quanto tem hoje para girar.</p>
                <div className="lote-money">
                  <input className="lote-field" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço R$" aria-label="Preço de venda" />
                  <input className="lote-field" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Custo R$" aria-label="Custo para fazer uma" />
                </div>
                <input className="lote-field" inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="Caixa hoje R$" aria-label="Caixa inicial" />
                <p>
                  Preço · custo · caixa inicial, em R$.
                </p>
                {error ? <p>{error}</p> : null}
                <button type="button" className="lote-go" disabled={busy} onClick={() => void start()}>
                  Abrir o lote
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const stallPrice = upgradeCost(lote.stallLevel, 8000);
  const toolsPrice = upgradeCost(lote.toolsLevel, 7000);
  const signPrice = upgradeCost(lote.signLevel, 5000);

  return (
    <div className="lote-root">
      <header className="lote-hud">
        <div className="lote-hud-brand">
          <span>Dia {lote.day}</span>
          <strong>{lote.business}</strong>
        </div>
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
      </header>
      <div className="lote-stage">
        <LoteWorld
          stallLevel={lote.stallLevel}
          stock={lote.stock}
          you={you}
          pops={pops}
          onProduce={() => void act('produce', 2, 2)}
          onSell={() => void act('sell', 6, 5)}
          onStall={() => {
            setYou({ col: 4, row: 2 });
            setShop(true);
          }}
        />
      </div>
      <p className="lote-log">{error || lote.log}</p>
      {shop ? (
        <div className="lote-sheet">
          <h2>Melhorar o lote</h2>
          <button type="button" className="lote-up" disabled={lote.stallLevel >= 3} onClick={() => void act('upgrade-stall', 4, 2)}>
            <span>Banca / tenda maior</span>
            <small>{lote.stallLevel >= 3 ? 'máx' : fromCents(stallPrice)}</small>
          </button>
          <button type="button" className="lote-up" disabled={lote.toolsLevel >= 3} onClick={() => void act('upgrade-tools', 2, 2)}>
            <span>Ferramenta — produz mais barato</span>
            <small>{lote.toolsLevel >= 3 ? 'máx' : fromCents(toolsPrice)}</small>
          </button>
          <button type="button" className="lote-up" disabled={lote.signLevel >= 3} onClick={() => void act('upgrade-sign', 6, 5)}>
            <span>Placa na estrada — mais clientes</span>
            <small>{lote.signLevel >= 3 ? 'máx' : fromCents(signPrice)}</small>
          </button>
          <button type="button" className="lote-up" onClick={() => setShop(false)}>
            <span>Fechar</span>
            <small>mapa</small>
          </button>
        </div>
      ) : null}
      <nav className="lote-dock">
        <button type="button" className="lote-act is-go" disabled={busy} onClick={() => void act('produce', 2, 2)}>
          Produzir
        </button>
        <button type="button" className="lote-act is-go" disabled={busy} onClick={() => void act('sell', 6, 5)}>
          Vender
        </button>
        <button type="button" className="lote-act" disabled={busy} onClick={() => void act('rest', 3, 4)}>
          Dormir
        </button>
      </nav>
    </div>
  );
}
