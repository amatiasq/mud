import { Pattern, SinglePattern } from './../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_ARTICLE = /(?:un|una|el|la|los|las|unos|unas)/;

export type MobName = typeof MOB_SUSTANTIVES[number];

const ALLIES = ['armadillo'];

const MOB_SUSTANTIVES = [
  'goblin',
  'lobo',
  'ogro',
  'orco',

  'adorador',
  'buitre',
  'caracol',
  'ciervo',
  'conejo',
  'cultista',
  'dragon',
  'empleado',
  'fanatico',
  'guardia',
  'ladron',
  'merodeador',
  'murcielago',
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

export function getMobsPresence() {
  return MOBS.map(x => x.trigger).flat();
}

export function getMobFromPrecence(pattern: SinglePattern[]) {
  for (const mob of MOBS) {
    const triggers = Array.isArray(mob.trigger) ? mob.trigger : [mob.trigger];

    if (triggers.some(x => pattern.includes(x))) {
      return mob;
    }
  }
}

const MOBS: { trigger: Pattern; name?: MobName }[] = [
  {
    trigger: 'Un buitre carronyero esta aqui.',
  },
  {
    trigger: 'Un corpulento orco esta aqui de guardia.',
  },
  {
    trigger:
      'Un deforme humano, un engendro de la magia, quiere descargar su agresividad.',
  },
  {
    trigger: 'Un gran lobo negro, te muestra los colmillos hambriento.',
  },
  {
    trigger: 'Un lobo feroz esta aqui y grunye muy enojado.',
  },
  {
    trigger: 'Un lobo hambriento te esta mirando',
  },
  {
    trigger:
      'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
  },
  {
    trigger: 'Un orco fuera de servicio esta sentado aqui jugando a las dados.',
  },
  {
    trigger: 'Un pequenyo caracol esta aqui haciendo trompos.',
  },
  {
    trigger: 'Un pequenyo orco se sienta en una de las sillas roncando.',
  },
  {
    trigger: 'Un sargento orco mantiene vigilada la chusma a la que comanda.',
  },
  {
    trigger:
      'Una joven cultista parece bastante serena, mientras no vea a nadie m',
  },
  {
    trigger: 'Una serpiente que parece venenosa te mira fijamente.',
  },
  {
    trigger: /Kivon, el l.der del culto, no est. nada contento con intromisiones\./,
  },
  { trigger: /Nejane, la l.der, parece estar en trance\./ },
  { trigger: /Un adorador mira con c.lera a su alrededor\./ },
  { trigger: /Un devoto adorador mira con c.lera a su alrededor\./ },
  { trigger: /Un Guardia Real est. aqu. velando por la seguridad del estadio/ },
  {
    trigger: /Un humano pose.do por el fanatismo busca 'herejes'\./,
    name: 'fanatico',
  },
  {
    trigger: /Un guardian de la monta.a esta aqu., echando espuma por la boca\./,
    name: 'goblin',
  },
  {
    trigger:
      'Un habitante del bosque merodea por aqui, protegiendo su montanya.',
    name: 'goblin',
  },
];
