export type WorkshopPhrase = { id: string; es: string; pt: string };

export const IDENTITY_WORDS: WorkshopPhrase[] = [
  { id: 'familiares', es: 'Familiares', pt: 'Familiares' },
  { id: 'tradicionales', es: 'Tradicionales', pt: 'Tradicionais' },
  { id: 'artesanales', es: 'Artesanales', pt: 'Artesanais' },
  { id: 'autenticos', es: 'Auténticos', pt: 'Autênticos' },
  { id: 'cercanos', es: 'Cercanos', pt: 'Próximos' },
  { id: 'acogedores', es: 'Acogedores', pt: 'Acolhedores' },
  { id: 'alegres', es: 'Alegres', pt: 'Alegres' },
  { id: 'trabajadores', es: 'Trabajadores', pt: 'Trabalhadores' },
  { id: 'creativos', es: 'Creativos', pt: 'Criativos' },
  { id: 'confiables', es: 'Confiables', pt: 'Confiáveis' },
  { id: 'apasionados', es: 'Apasionados', pt: 'Apaixonados' },
  { id: 'independientes', es: 'Independientes', pt: 'Independentes' },
  { id: 'innovadores', es: 'Innovadores', pt: 'Inovadores' },
  { id: 'modernos', es: 'Modernos', pt: 'Modernos' },
  { id: 'sencillos', es: 'Sencillos', pt: 'Simples' },
];

export const PERCEPTION_PHRASES: WorkshopPhrase[] = [
  { id: 'alta-calidad', es: 'Parece una marca de alta calidad', pt: 'Parece uma marca de alta qualidade' },
  { id: 'confianza', es: 'Me inspira confianza', pt: 'Me inspira confiança' },
  { id: 'producto-especial', es: 'Parece un producto especial', pt: 'Parece um produto especial' },
  { id: 'elegante', es: 'Se siente elegante', pt: 'Parece elegante' },
  { id: 'accesible', es: 'Parece una marca accesible', pt: 'Parece uma marca acessível' },
  { id: 'probar', es: 'Me dan ganas de probar el producto', pt: 'Dá vontade de provar o produto' },
  { id: 'naturaleza', es: 'Me recuerda a la naturaleza', pt: 'Me lembra a natureza' },
  { id: 'campo', es: 'Me recuerda al campo y a la tierra', pt: 'Me lembra o campo e a terra' },
  { id: 'historia', es: 'Parece una marca con historia', pt: 'Parece uma marca com história' },
  { id: 'moderna', es: 'Se siente moderna y diferente', pt: 'Parece moderna e diferente' },
  { id: 'artesanal', es: 'Parece hecho de manera artesanal', pt: 'Parece feito de maneira artesanal' },
  { id: 'regalar', es: 'Parece un producto para regalar', pt: 'Parece um produto para presentear' },
  { id: 'pagaria', es: 'Pagaría un poco más por este producto', pt: 'Pagaria um pouco mais por este produto' },
  { id: 'dia-a-dia', es: 'Parece una marca para el día a día', pt: 'Parece uma marca para o dia a dia' },
  { id: 'saludable', es: 'Parece saludable y natural', pt: 'Parece saudável e natural' },
  { id: 'personalidad', es: 'Tiene personalidad propia', pt: 'Tem personalidade própria' },
  { id: 'frescura', es: 'Me transmite frescura y energía', pt: 'Me transmite frescor e energia' },
];

export function phraseLabel(list: WorkshopPhrase[], id: string, pt: boolean) {
  const item = list.find((p) => p.id === id);
  if (!item) return id;
  return pt ? item.pt : item.es;
}
