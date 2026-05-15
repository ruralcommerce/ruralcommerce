'use client';

import { useEffect, useRef } from 'react';
import type { Feature, GeoJsonObject } from 'geojson';

export type ContactTerritoryMapProps = {
  /** GeoJSON string: FeatureCollection; use properties.category = "atendimento" | "intervencao" (ou "intervención") */
  geoJsonString: string;
};

const DEFAULT_VIEW: [number, number] = [-34.9, -56.1645];
const DEFAULT_ZOOM = 7;

const LEAFLET_VER = '1.9.4';
const LEAFLET_BASE = `https://unpkg.com/leaflet@${LEAFLET_VER}/dist`;

interface MapHandle {
  remove(): void;
  fitBounds(bounds: { isValid(): boolean }, opts?: { padding?: [number, number]; maxZoom?: number }): void;
  setView(center: [number, number], zoom: number): MapHandle;
}

interface GeoJsonLayerHandle {
  addTo(map: MapHandle): GeoJsonLayerHandle;
  getBounds(): { isValid(): boolean };
}

interface LeafletBundle {
  map(el: HTMLElement, opts?: object): MapHandle;
  tileLayer(url: string, opts?: object): { addTo(map: MapHandle): unknown };
  geoJSON(
    data: GeoJsonObject,
    opts: {
      style?(feature?: Feature): object;
      pointToLayer?(feature: Feature, latlng: unknown): unknown;
      onEachFeature?(feature: Feature, layer: { bindPopup(s: string): void }): void;
    }
  ): GeoJsonLayerHandle;
  circleMarker(latlng: unknown, opts: object): unknown;
}

let leafletBundlePromise: Promise<LeafletBundle> | null = null;

function loadLeafletFromCdn(): Promise<LeafletBundle> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet: no window'));
  }
  const w = window as unknown as { L?: LeafletBundle };
  if (w.L) return Promise.resolve(w.L);

  if (!leafletBundlePromise) {
    leafletBundlePromise = new Promise((resolve, reject) => {
      const cssId = 'rc-leaflet-css';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = `${LEAFLET_BASE}/leaflet.css`;
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = `${LEAFLET_BASE}/leaflet.js`;
      script.async = true;
      script.onload = () => {
        const L = (window as unknown as { L?: LeafletBundle }).L;
        if (!L || typeof L.map !== 'function') {
          leafletBundlePromise = null;
          reject(new Error('Leaflet: window.L missing'));
          return;
        }
        resolve(L);
      };
      script.onerror = () => {
        leafletBundlePromise = null;
        reject(new Error('Leaflet: script failed'));
      };
      document.body.appendChild(script);
    });
  }

  return leafletBundlePromise;
}

function parseGeoJson(raw: string): GeoJsonObject | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return null;
    return data as GeoJsonObject;
  } catch {
    return null;
  }
}

function categoryOf(feature: Feature): string {
  const p = feature.properties as Record<string, unknown> | null | undefined;
  const c = (p?.category ?? p?.categoria) as string | undefined;
  const v = (c ?? 'atendimento').toLowerCase();
  if (v === 'intervencao' || v === 'intervención' || v === 'intervention') return 'intervencao';
  return 'atendimento';
}

function ContactTerritoryMap({ geoJsonString }: ContactTerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapHandle | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    (async () => {
      let L: LeafletBundle;
      try {
        L = await loadLeafletFromCdn();
      } catch {
        return;
      }
      if (!L || typeof L.map !== 'function') return;
      if (cancelled || !containerRef.current) return;

      const data = parseGeoJson(geoJsonString);
      const map = L.map(el, {
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView(DEFAULT_VIEW, DEFAULT_ZOOM);
      mapRef.current = map;

      if (cancelled) {
        map.remove();
        mapRef.current = null;
        return;
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (!data) {
        return;
      }

      const geoLayer = L.geoJSON(data, {
        style(feature) {
          const cat = feature ? categoryOf(feature as Feature) : 'atendimento';
          if (cat === 'intervencao') {
            return { color: '#f5d0fe', weight: 2, fillColor: '#a21caf', fillOpacity: 0.5 };
          }
          return { color: '#99f6e4', weight: 1.5, fillColor: '#14b8a6', fillOpacity: 0.28 };
        },
        pointToLayer(feature, latlng) {
          const cat = categoryOf(feature as Feature);
          const isInt = cat === 'intervencao';
          return L.circleMarker(latlng, {
            radius: isInt ? 9 : 7,
            color: isInt ? '#f5d0fe' : '#ccfbf1',
            weight: 2,
            fillColor: isInt ? '#a21caf' : '#0d9488',
            fillOpacity: 0.85,
          });
        },
        onEachFeature(feature, layer) {
          const name = (feature.properties as Record<string, unknown> | undefined)?.name;
          if (typeof name === 'string' && name.trim()) {
            layer.bindPopup(name.trim());
          }
        },
      }).addTo(map);

      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9 });
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [geoJsonString]);

  return <div ref={containerRef} className="relative z-0 h-full min-h-[280px] w-full md:min-h-[360px]" />;
}

export default ContactTerritoryMap;
export { ContactTerritoryMap };
