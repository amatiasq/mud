import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_ARTICLE = /(?:un|una|el|la|los|las|unos|unas)/;

export type MobName = typeof MOB_SUSTANTIVES[number];

const ALLIES = ['armadillo'];

const MOB_SUSTANTIVES = [
  'buitre',
  'caracol',
  'ciervo',
  'conejo',
  'dragon',
  'empleado',
  'guardia',
  'ladron',
  'lobo',
  'merodeador',
  'murcielago',
  'ogro',
  'orco',
  'pantera',
  'serpiente',
] as const;

export function getMobIn(text: string) {
  const lower = text.toLowerCase();

  if (ALLIES.some(x => lower.includes(x))) {
    return null;
  }

  const result = MOB_SUSTANTIVES.find(x => lower.includes(x));

  if (!result) {
    console.warn(`Unknown sustantive for "${text}"`);
  }

  return result;
}

export const MOB_ARRIVES = concatRegexes(
  MOB_ARTICLE,
  / (?<mob>(?: \w+)) llega desde el (?<direction>\w+)/,
);

export const MOB_LEAVES = concatRegexes(
  MOB_ARTICLE,
  / (?<mob>(?: \w+)) (?:se va)|(?:vuela) hacia (?:el )?(?<direction>\w+)/,
);

export const MOB_PRESENT = [
  'Un pequenyo caracol esta aqui haciendo trompos.', //: 1,
  'Un buitre carronyero esta aqui.', //: 1,
  'Un lobo hambriento te esta mirando', //: 1,
  'Una serpiente que parece venenosa te mira fijamente.', //: 1,
  /Un Guardia Real est. aqu. velando por la seguridad del estadio/, //: 14,
  'Un corpulento orco esta aqui de guardia.',
  'Un sargento orco mantiene vigilada la chusma a la que comanda.',
  'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
  'Un pequenyo orco se sienta en una de las sillas roncando.',
];
