import { Pattern, SinglePattern } from './../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_ARTICLE = /(?:un|una|el|la|los|las|unos|unas)/;
const ALLIES = ['armadillo', 'lince'];

const MOB_GENERIC = {
  // 'Un deforme humano, un engendro de la magia, quiere descargar su agresividad.',
  adorador: [
    /Un adorador mira con c.lera a su alrededor\./,
    /Un devoto adorador mira con c.lera a su alrededor\./,
  ],
  aguila: [
    'Una gigantesca aguila vuela a tu alrededor.',
    'Una enorme aguila esta aqui profundamente dormido.',
  ],
  buitre: 'Un buitre carronyero esta aqui.',
  calamar: 'Un calamar gigante esta aqui nadando.',
  caracol: 'Un pequenyo caracol esta aqui haciendo trompos.',
  ciervo: null,
  conejo: null,
  criatura:
    'Una poderosa criatura del pantano esta aqui profundamente dormido.',
  cubo: 'Un enorme cubo transparente de materia gelatinosa rezuma ante ti.',
  cultista:
    'Una joven cultista parece bastante serena, mientras no vea a nadie m',
  dragon: null,
  empleado: null,
  espiritu: /Un esp.ritu se desliza por el aire./,
  esqueleto: [
    'Un esqueleto polvoriento esta aqui.',
    'Un esqueleto huesudo esta aqui profundamente dormido.',
    'El esqueleto hace castanyetear sus dientes amenazadoramente y se acerca!',
    'Un esqueleto con armadura avanza torpemente a traves de los arboles.',
  ],
  fanatico: /Un humano pose.do por el fanatismo busca 'herejes'\./,
  gusano: 'Un gusano de roca esta aqui profundamente dormido.',
  hobgoblin: [
    'un guardia hobgoblin de elite esta aqui profundamente dormido.',
    /Un guardian de la monta.a esta aqu., echando espuma por la boca\./,
    'Un macizo hobgoblin esta de guardia cerca del hueco de la escalera.',
    'Un hobgoblin armado esta aqui, interrogando a un prisionero.',
  ],
  gnoll: 'un gnoll feo esta aqui profundamente dormido.',
  goblin: [
    'Un habitante del bosque merodea por aqui, protegiendo su montanya.',
    /Un guardian de la monta.a esta aqu., echando espuma por la boca\./,
    'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
    'un goblin negrero esta aqui profundamente dormido.',
  ],
  guardia: /Un Guardia Real est. aqu. velando por la seguridad del estadio/,
  guerrero: 'Un guerrero asqueroso grunye al verte.',
  jefe: [
    'Un jefe esta aqui descansando.',
    'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
  ],
  ladron: 'Un ladron esta aqui profundamente dormido.',
  lobo: [
    'Un lobo hambriento te esta mirando',
    'Un lobo feroz esta aqui y grunye muy enojado.',
    'Un gran lobo negro, te muestra los colmillos hambriento.',
  ],
  mago: 'Un mago viejo esta aqui profundamente dormido.',
  merodeador: null,
  murcielago: null,
  ogro: [
    'el capitan ogro esta aqui profundamente dormido.',
    'Un gigantesco ogro juega con una enorme roca lanzandola al aire.',
  ],
  orco: [
    'El arquero orco esta aqui profundamente dormido.',
    'El capitan orco te observa con sus ojos llenos de furia.',
    'El chaman esta sentado detras de un escritorio, escribiendo una misiva.',
    'El desagradable y malioliente espadachin orco esta aqui.',
    'el jefe orco minero esta aqui profundamente dormido.',
    'el orco espadachin esta aqui profundamente dormido.',
    'El orco espadachin esta aqui profundamente dormido.',
    'El orco espadachin llega desde el este.',
    'Un asqueroso arquero orco esta aqui.',
    'Un corpulento orco esta aqui de guardia.',
    'Un jefe orco esta aqui profundamente dormido.',
    'Un orco esta de pie al lado de la ballesta.',
    'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
    'Un orco fuera de servicio esta sentado aqui jugando a los dados.',
    'un orco minero esta aqui profundamente dormido.',
    'Un pequenyo orco se sienta en una de las sillas roncando.',
    'Un sargento orco mantiene vigilada la chusma a la que comanda.',
    'Un voluminoso cocinero orco sopesa un cuchillo de carnicero manchado de sangre.',
  ],
  pantera: null,
  piranya: [
    'una piranya esta aqui profundamente dormido.',
    'Una piranya esta aqui profundamente dormido.',
    'Una piranya te mira con su enorme boca.',
  ],
  rata: 'Una rata gigante esta aqui profundamente dormido.',
  sapo: 'un sapo gigante esta aqui profundamente dormido.',
  serpiente: 'Una serpiente que parece venenosa te mira fijamente.',
  'urik-hai': [
    'Un asqueroso arquero uruk-hai tensa su arco al verte.',
    'Un superior uruk-hai esta aqui vigilando.',
  ],
  zombie: 'Un zombie se acerca hacia ti con los brazos extendidos.',
};

const MOB_CHARACTERS = {
  Kivon: /Kivon, el l.der del culto, no est. nada contento con intromisiones\./,
  Nejane: /Nejane, la l.der, parece estar en trance\./,
} as const;

const MOBS: Mob[] = Object.entries({
  ...MOB_CHARACTERS,
  ...MOB_GENERIC,
}).map(([name, presence]) => ({
  name: name as MobName,
  presence,
}));

type GenericMobName = keyof typeof MOB_GENERIC;
type CharacterMobName = keyof typeof MOB_CHARACTERS;

// PUBLIC

export type MobName = GenericMobName | CharacterMobName;

export const ATTACK_RECEIVED = concatRegexes(
  /El \w+ de /,
  MOB_ARTICLE,
  / (?<mob>(?: |\w)+) te /,
);

export interface Mob {
  name: MobName;
  presence?: Pattern | null;
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
