/** GeoJSON de exemplo (Uruguay): polígono "atendimento" + pontos "intervencao". Editar no CMS ou substituir por dados reais. */
export const CONTACT_MAP_DEFAULT_TERRITORIES_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { category: 'atendimento', name: 'Cobertura sur y litoral' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-57.12, -34.52],
            [-55.82, -34.52],
            [-55.82, -35.18],
            [-57.12, -35.18],
            [-57.12, -34.52],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { category: 'intervencao', name: 'Montevideo' },
      geometry: { type: 'Point', coordinates: [-56.1881, -34.9011] },
    },
    {
      type: 'Feature',
      properties: { category: 'intervencao', name: 'Salto' },
      geometry: { type: 'Point', coordinates: [-57.9625, -31.3833] },
    },
  ],
});
