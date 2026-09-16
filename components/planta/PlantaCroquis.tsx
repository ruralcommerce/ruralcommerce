'use client';

import { useState } from 'react';
import { getPlantaPageCopy, zonaCopy, type PlantaZoneId } from '@/lib/planta-guide';

const zones: PlantaZoneId[] = ['sucia', 'humeda', 'limpia'];

export function PlantaCroquis({ locale }: { locale: string }) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  const t = getPlantaPageCopy(locale);
  const copy = zonaCopy[key];
  const [active, setActive] = useState<PlantaZoneId>('humeda');

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-[#2F3336]/80">{t.croquisLegend}</p>
      <div className="planta-croquis">
        <svg viewBox="0 0 640 430" role="img" aria-label="Croquis 4,0 × 5,5 m">
          <rect x="0" y="0" width="640" height="430" fill="#e8eee9" />
          <text x="28" y="28" fill="#071F5E" fontSize="13" fontWeight="700">
            Centro de acopio
          </text>
          <rect x="18" y="40" width="70" height="330" rx="10" fill="#c5d0c8" />
          <g transform="translate(110 36)">
            <rect x="0" y="0" width="460" height="350" rx="8" fill="#f7f4ee" stroke="#071F5E" strokeWidth="3" />
            <rect
              className="planta-zone-btn"
              x="8"
              y="8"
              width="108"
              height="334"
              rx="6"
              fill={active === 'sucia' ? '#d7ebe4' : '#e4ece7'}
              stroke={active === 'sucia' ? '#009179' : 'transparent'}
              strokeWidth="3"
              onClick={() => setActive('sucia')}
            />
            <rect
              className="planta-zone-btn"
              x="124"
              y="8"
              width="168"
              height="334"
              rx="6"
              fill={active === 'humeda' ? '#cfe8e1' : '#dde8e3'}
              stroke={active === 'humeda' ? '#009179' : 'transparent'}
              strokeWidth="3"
              onClick={() => setActive('humeda')}
            />
            <rect
              className="planta-zone-btn"
              x="300"
              y="8"
              width="152"
              height="334"
              rx="6"
              fill={active === 'limpia' ? '#d9e8f7' : '#e7eef6'}
              stroke={active === 'limpia' ? '#071F5E' : 'transparent'}
              strokeWidth="3"
              onClick={() => setActive('limpia')}
            />
            <path d="M300 342 L124 318" stroke="#c9a227" strokeWidth="3" strokeDasharray="7 6" />
            <circle cx="156" cy="300" r="11" fill="#f2d56b" stroke="#8a6d12" />
            <circle cx="248" cy="312" r="11" fill="#f2d56b" stroke="#8a6d12" />
            <rect x="132" y="22" width="36" height="22" rx="4" fill="#71c4b4" stroke="#071F5E" />
            <rect x="392" y="318" width="36" height="22" rx="4" fill="#f2d56b" stroke="#8a6d12" />
            {[0, 1, 2].map((col) =>
              [0, 1].map((row) => (
                <circle
                  key={`${col}-${row}`}
                  cx={90 + col * 130}
                  cy={70 + row * 130}
                  r="9"
                  fill="#f2d56b"
                  stroke="#8a6d12"
                />
              ))
            )}
            <rect x="206" y="-8" width="48" height="16" fill="#071F5E" />
            <rect x="206" y="342" width="48" height="16" fill="#071F5E" />
            <rect x="452" y="150" width="16" height="54" fill="#8aa4c9" />
            <path d="M430 8 L446 -18" stroke="#c9a227" strokeWidth="4" />
            <text x="448" y="-22" fill="#8a6d12" fontSize="11" fontWeight="700">
              solar
            </text>
            <text x="18" y="28" fill="#071F5E" fontSize="12" fontWeight="700">
              sucia
            </text>
            <text x="168" y="28" fill="#071F5E" fontSize="12" fontWeight="700">
              húmeda
            </text>
            <text x="332" y="28" fill="#071F5E" fontSize="12" fontWeight="700">
              limpia
            </text>
          </g>
          <text x="110" y="408" fill="#071F5E" fontSize="12">
            5,5 m
          </text>
          <text x="580" y="220" fill="#071F5E" fontSize="12">
            4,0 m
          </text>
        </svg>
      </div>
      <div className="planta-grid planta-grid-3">
        {zones.map((zone) => (
          <button
            key={zone}
            type="button"
            className={`planta-card text-left${active === zone ? ' ring-2 ring-[#009179]' : ''}`}
            onClick={() => setActive(zone)}
          >
            <h3>{copy[zone].title}</h3>
            <p>{copy[zone].body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
