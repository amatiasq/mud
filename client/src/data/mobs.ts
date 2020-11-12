import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_ARTICLE = /(?:un|una|el|la|los|las|unos|unas)/;

export type MobName = typeof MOB_SUSTANTIVES[number];

const ALLIES = ['armadillo'];

const MOB_SUSTANTIVES = [
  'adorador',
  'buitre',
  'caracol',
  'ciervo',
  'conejo',
  'cultista',
  'dragon',
  'empleado',
  'fanat', // fanatico
  'goblin',
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
  'Un buitre carronyero esta aqui.', //: 1,
  'Un corpulento orco esta aqui de guardia.',
  'Un deforme humano, un engendro de la magia, quiere descargar su agresividad.',
  'Un gran lobo negro, te muestra los colmillos hambriento.',
  'Un lobo feroz esta aqui y grunye muy enojado.',
  'Un lobo hambriento te esta mirando', //: 1,
  'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
  'Un pequenyo caracol esta aqui haciendo trompos.', //: 1,
  'Un pequenyo orco se sienta en una de las sillas roncando.',
  'Un sargento orco mantiene vigilada la chusma a la que comanda.',
  'Una joven cultista parece bastante serena, mientras no vea a nadie m',
  'Una serpiente que parece venenosa te mira fijamente.', //: 1,
  /Kivon, el l.der del culto, no est. nada contento con intromisiones\./,
  /Nejane, la l.der, parece estar en trance\./,
  /Un adorador mira con c.lera a su alrededor\./,
  /Un devoto adorador mira con c.lera a su alrededor\./,
  /Un Guardia Real est. aqu. velando por la seguridad del estadio/, //: 14,
  /Un humano pose.do por el fanatismo busca 'herejes'\./,
];
