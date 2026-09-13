const LEFT = [
  'Neblina',
  'Sol',
  'Lote',
  'Serra',
  'Rio',
  'Chuva',
  'Terra',
  'Lua',
  'Vento',
  'Raiz',
  'Brisa',
  'Por do Sol',
  'Orvalho',
  'Cerrado',
  'Mata',
];

const RIGHT = [
  'Jaca',
  'Leite',
  'Goiaba',
  'Cacau',
  'Mel',
  'Cafe',
  'Milho',
  'Mandioca',
  'Caju',
  'Banana',
  'Queijo',
  'Melancia',
  'Feijao',
  'Acai',
  'Cupuacu',
];

function pick<T>(list: T[], seed: number) {
  return list[Math.abs(seed) % list.length];
}

export function makeSementeAlias(publicId: string, used: Set<string>) {
  const numeric = Array.from(publicId).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
  for (let offset = 0; offset < LEFT.length * RIGHT.length; offset += 1) {
    const alias = `${pick(LEFT, numeric + offset)} ${pick(RIGHT, numeric + offset * 7)}`;
    if (!used.has(alias.toLowerCase())) return alias;
  }
  return `Lote ${publicId.slice(-4).toUpperCase()}`;
}
