'use client';

const MAP = ['TTTTTTTT', 'TggggggT', 'TgWWSSgT', 'TgWWSSgT', 'TggppggT', 'TggppMMT', 'RRRRRRRR'];

const TILE: Record<string, string> = {
  T: 'is-tree',
  g: 'is-grass',
  W: 'is-work',
  S: 'is-stall',
  p: 'is-path',
  M: 'is-market',
  R: 'is-road',
};

export function LoteWorld({
  stallLevel,
  stock,
  you,
  pops,
  onProduce,
  onSell,
  onStall,
}: {
  stallLevel: number;
  stock: number;
  you: { col: number; row: number };
  pops: { id: number; col: number; row: number; text: string }[];
  onProduce: () => void;
  onSell: () => void;
  onStall: () => void;
}) {
  return (
    <div className="lote-board" aria-label="Mapa do lote">
      {MAP.flatMap((row, y) =>
        row.split('').map((cell, x) => {
          const hot = cell === 'W' || cell === 'M' || cell === 'S';
          const level = cell === 'S' ? ` lv-${Math.min(3, stallLevel)}` : '';
          return (
            <button
              key={`${x}-${y}`}
              type="button"
              className={`lote-tile ${TILE[cell] || 'is-grass'}${level}${hot ? ' is-hot' : ''}`}
              disabled={!hot}
              onClick={() => {
                if (cell === 'W') onProduce();
                if (cell === 'M') onSell();
                if (cell === 'S') onStall();
              }}
              aria-label={cell === 'W' ? 'Produzir' : cell === 'M' ? 'Vender' : cell === 'S' ? 'Melhorar' : undefined}
            >
              {cell === 'S' || cell === 'M' ? <span className="lote-build" /> : null}
              {cell === 'W' ? (
                <span className="lote-crates">
                  {Array.from({ length: Math.min(4, Math.max(1, Math.ceil(stock / 3))) }).map((_, index) => (
                    <i key={index} />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })
      )}
      <div
        className="lote-you"
        style={{ left: `${(you.col / 8) * 100 + 1.5}%`, top: `${(you.row / 7) * 100 + 4}%` }}
      >
        <span />
      </div>
      {pops.map((pop) => (
        <b
          key={pop.id}
          className="lote-pop"
          style={{ left: `${((pop.col + 0.5) / 8) * 100}%`, top: `${((pop.row + 0.2) / 7) * 100}%` }}
        >
          {pop.text}
        </b>
      ))}
    </div>
  );
}
