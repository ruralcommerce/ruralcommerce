import { M, sx, sy } from '@/components/planta/planta-svg';
import type { Equipo3D } from '@/lib/planta-planos';

const ink = '#071F5E';
const steel = '#d9e3ec';
const steelDark = '#8aa0b8';

function box(item: Equipo3D, fill: string, selected: boolean) {
  return (
    <rect
      x={sx(item.x)}
      y={sy(item.y)}
      width={item.w * M}
      height={item.d * M}
      fill={fill}
      stroke={selected ? '#009179' : ink}
      strokeWidth={selected ? 2.4 : 1.4}
    />
  );
}

export function EquipoSymbol({
  item,
  selected,
  label,
  onClick,
}: {
  item: Equipo3D;
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  const x = sx(item.x);
  const y = sy(item.y);
  const w = item.w * M;
  const d = item.d * M;
  const cx = x + w / 2;
  const cy = y + d / 2;

  return (
    <g className="planta-zone-btn" onClick={onClick} role="button" tabIndex={0}>
      {item.id === 'pila' || item.id === 'pila-ext' ? (
        <g>
          {box(item, '#eef6f8', selected)}
          <ellipse cx={x + w * 0.28} cy={cy} rx={w * 0.18} ry={d * 0.32} fill="#c5d4e8" stroke={ink} />
          <ellipse cx={x + w * 0.72} cy={cy} rx={w * 0.18} ry={d * 0.32} fill="#c5d4e8" stroke={ink} />
          <rect x={cx - 5} y={y + 4} width="10" height="10" rx="2" fill="#fff" stroke={ink} />
          <line x1={cx} y1={y + 14} x2={cx} y2={cy - 8} stroke={ink} />
        </g>
      ) : null}
      {item.id === 'lavamanos' ? (
        <g>
          {box(item, '#eef6f8', selected)}
          <ellipse cx={cx} cy={cy - 2} rx={w * 0.32} ry={d * 0.28} fill="#c5d4e8" stroke={ink} />
          <rect x={cx - 4} y={y + 3} width="8" height="8" fill="#fff" stroke={ink} />
          <line x1={x + 8} y1={y + d - 6} x2={x + 18} y2={y + d - 6} stroke={ink} strokeWidth="2" />
        </g>
      ) : null}
      {item.id === 'canastas' || item.id === 'mesa-env' || item.id === 'mesa-prep' ? (
        <g>
          {box(item, '#f4efe6', selected)}
          {[0.18, 0.5, 0.82].map((t) => (
            <rect
              key={t}
              x={x + w * t - 14}
              y={y + 8}
              width="28"
              height={d - 16}
              fill="none"
              stroke={ink}
              strokeDasharray={item.id === 'canastas' ? '4 3' : undefined}
            />
          ))}
        </g>
      ) : null}
      {item.id === 'molino' ? (
        <g>
          {box(item, steel, selected)}
          <circle cx={cx} cy={cy + 4} r={Math.min(w, d) * 0.28} fill="#fff" stroke={ink} />
          <polygon
            points={`${cx - 14},${y + 8} ${cx + 14},${y + 8} ${cx},${cy - 6}`}
            fill="#fff"
            stroke={ink}
          />
        </g>
      ) : null}
      {item.id === 'fogon' ? (
        <g>
          {box(item, '#3a3a3a', selected)}
          {[0.28, 0.72].flatMap((tx) =>
            [0.3, 0.7].map((ty) => (
              <circle
                key={`${tx}-${ty}`}
                cx={x + w * tx}
                cy={y + d * ty}
                r={Math.min(w, d) * 0.12}
                fill="none"
                stroke="#f2c94c"
                strokeWidth="1.8"
              />
            )),
          )}
        </g>
      ) : null}
      {item.id === 'dehydrator' ? (
        <g>
          {box(item, '#fff8d6', selected)}
          {[0.22, 0.4, 0.58, 0.76].map((t) => (
            <line key={t} x1={x + 10} y1={y + d * t} x2={x + w - 10} y2={y + d * t} stroke={ink} />
          ))}
          <rect x={x + w - 16} y={y + 8} width="10" height={d - 16} fill={steelDark} stroke={ink} />
        </g>
      ) : null}
      {item.id === 'extractor' ? (
        <g>
          {box(item, '#fff', selected)}
          <circle cx={cx} cy={cy} r={Math.min(w, d) * 0.32} fill="none" stroke={ink} />
          <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke={ink} />
          <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke={ink} />
        </g>
      ) : null}
      {item.id === 'selladora' ? (
        <g>
          {box(item, '#f4efe6', selected)}
          <rect x={x + 8} y={cy - 6} width={w - 16} height="12" fill={steel} stroke={ink} />
        </g>
      ) : null}
      {item.id === 'estante' ? (
        <g>
          {box(item, '#f7f4ee', selected)}
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={x + 4} y1={y + d * t} x2={x + w - 4} y2={y + d * t} stroke={ink} />
          ))}
        </g>
      ) : null}
      {item.id === 'gabachas' ? (
        <g>
          {box(item, '#f7f4ee', selected)}
          {[0.2, 0.4, 0.6, 0.8].map((t) => (
            <g key={t}>
              <circle cx={cx} cy={y + d * t} r="3" fill="none" stroke={ink} />
              <path d={`M ${cx} ${y + d * t + 3} L ${cx - 8} ${y + d * t + 16} L ${cx + 8} ${y + d * t + 16} Z`} fill="none" stroke={ink} />
            </g>
          ))}
        </g>
      ) : null}
      {item.id === 'tablero' ? (
        <g>
          {box(item, ink, selected)}
          {[0.25, 0.45, 0.65].map((t) => (
            <rect key={t} x={x + 6} y={y + d * t} width={w - 12} height="6" fill="#52ADAD" />
          ))}
        </g>
      ) : null}
      {item.id === 'tanque' ? (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={Math.min(w, d) / 2}
            fill="#d7ebe4"
            stroke={selected ? '#009179' : ink}
            strokeWidth={selected ? 2.4 : 1.6}
          />
          <ellipse cx={cx} cy={y + 10} rx={w * 0.28} ry="6" fill="none" stroke={ink} />
        </g>
      ) : null}
      <text
        x={cx}
        y={item.id === 'tablero' ? cy + 4 : y + d + 14}
        textAnchor="middle"
        fill={item.id === 'tablero' ? '#F2F2F2' : ink}
        fontSize="10"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
}
