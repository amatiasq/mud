import { concatRegexes } from '../lib/util/concatRegexes';

export type ItemName = typeof ITEM_SUSTANTIVES[number];

export const ITEM_ARTICLE = /(?: (?:un|una|el|la|los|las|unos|unas))?/;

export const WEAR = [
  'Te colocas ',
  'Te pones ',
  'Metes las piernas ',
  'Vistes ',
  'Usas ',
];
export const UNWEAR = concatRegexes(
  /Dejas de usar/,
  ITEM_ARTICLE,
  / (?<item>[^.]+?)\./,
);

export const ITEM_SUSTANTIVES = [
  'amuleto',
  'anillo',
  'anteojos',
  'armadura',
  'baculo',
  'baston',
  'bola',
  'botas',
  'brazal',
  'brazalete',
  'brazaletes',
  'brigandina',
  'capa',
  'capote',
  'casco',
  'cetro',
  'cinto',
  'cinturon',
  'cinturón',
  'coderas',
  'colgante',
  'collar',
  'coraza',
  'cota',
  'cubrepiernas',
  'daga',
  'escudo',
  'espada',
  'faja',
  'faldones',
  'grebas',
  'guanteletes',
  'guantes',
  'hacha',
  // 'joya',
  'lanza',
  'luz',
  'mangas',
  'manoplas',
  'martillo',
  'maza',
  'mocasines',
  'pendiente',
  'perneras',
  'peto',
  'pica',
  'placa',
  'polainas',
  'pulsera',
  'ropaje',
  'sentido',
  'sombrero',
  'tobillera',
  'vara',
  'varita',
  'visera',
  'yelmo',
] as const;

export function getItemSustantive(item: string): ItemName | null {
  const lower = item.toLowerCase();
  const found = ITEM_SUSTANTIVES.find(x => lower.includes(x));

  if (!found) {
    console.warn('Unknown item sustantive:', item);
    return null;
  }

  return found;
}
