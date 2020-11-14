import { Pattern, SinglePattern } from './../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_ARTICLE = /(?:un|una|el|la|los|las|unos|unas)/;
const ALLIES = ['armadillo'];

const MOB_GENERIC = {
  // 'Un deforme humano, un engendro de la magia, quiere descargar su agresividad.',

  adorador: {
    presence: [
      /Un adorador mira con c.lera a su alrededor\./,
      /Un devoto adorador mira con c.lera a su alrededor\./,
    ],
  },
  buitre: {
    presence: 'Un buitre carronyero esta aqui.',
  },
  caracol: {
    presence: 'Un pequenyo caracol esta aqui haciendo trompos.',
  },
  ciervo: {},
  conejo: {},
  cultista: {
    presence:
      'Una joven cultista parece bastante serena, mientras no vea a nadie m',
  },
  dragon: {},
  empleado: {},
  fanatico: {
    presence: /Un humano pose.do por el fanatismo busca 'herejes'\./,
  },
  hobgoblin: {
    presence: [
      'un guardia hobgoblin de elite esta aqui profundamente dormido.',
      /Un guardian de la monta.a esta aqu., echando espuma por la boca\./,
      'Un macizo hobgoblin esta de guardia cerca del hueco de la escalera.',
    ],
  },
  goblin: {
    presence: [
      'Un habitante del bosque merodea por aqui, protegiendo su montanya.',
      /Un guardian de la monta.a esta aqu., echando espuma por la boca\./,
      'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
    ],
  },
  guardia: {
    presence: /Un Guardia Real est. aqu. velando por la seguridad del estadio/,
  },
  jefe: {
    presence: 'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
  },
  ladron: {},
  lobo: {
    presence: [
      'Un lobo hambriento te esta mirando',
      'Un lobo feroz esta aqui y grunye muy enojado.',
      'Un gran lobo negro, te muestra los colmillos hambriento.',
    ],
  },
  merodeador: {},
  murcielago: {},
  ogro: {
    presence: 'el capitan ogro esta aqui profundamente dormido.',
  },
  orco: {
    presence: [
      'Un corpulento orco esta aqui de guardia.',
      'Un orco esta de pie al lado de la ballesta.',
      'Un pequenyo orco se sienta en una de las sillas roncando.',
      'Un sargento orco mantiene vigilada la chusma a la que comanda.',
      'Un orco fuera de servicio esta sentado aqui jugando a los dados.',
      'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
      'El capitan orco te observa con sus ojos llenos de furia.',
    ],
  },
  pantera: {},
  serpiente: {
    presence: 'Una serpiente que parece venenosa te mira fijamente.',
  },
};

const MOB_CHARACTERS = {
  Kivon: /Kivon, el l.der del culto, no est. nada contento con intromisiones\./,
  Nejane: /Nejane, la l.der, parece estar en trance\./,
} as const;

type GenericMobName = keyof typeof MOB_GENERIC;
type CharacterMobName = keyof typeof MOB_CHARACTERS;

const MOBS: Mob[] = [
  ...Object.entries(MOB_GENERIC).map(([name, desc]) => ({
    ...desc,
    name: name as GenericMobName,
  })),
  ...Object.entries(MOB_CHARACTERS).map(([name, pattern]) => ({
    name: name as CharacterMobName,
    pattern,
  })),
];

// PUBLIC

export type MobName = GenericMobName | CharacterMobName;

export interface Mob {
  name: MobName;
  presence?: Pattern;
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
  return MOBS.map(x => x.presence)
    .flat()
    .filter(Boolean) as Pattern;
}

export function getMobFromPresence(patterns: SinglePattern[]) {
  return MOBS.filter(x => x.presence).find(({ presence }) =>
    Array.isArray(presence)
      ? patterns.some(x => presence.includes(x))
      : patterns.includes(presence!),
  );
}

export function getMobIn(text: string) {
  const lower = text.toLowerCase();

  if (ALLIES.some(x => lower.includes(x))) {
    return null;
  }

  const result = MOBS.find(x => lower.includes(x.name));

  if (!result) {
    console.warn(`Unknown sustantive for "${text}"`);
  }

  return result;
}
