import { Pattern, SinglePattern } from '../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';

const MOB_GENERIC = {
  adorador: [
    'Un adorador mira con cólera a su alrededor.',
    'Un devoto adorador mira con cólera a su alrededor.',
  ],
  aguila: [
    'Una enorme aguila esta aqui profundamente dormido.',
    'Una gigantesca aguila vuela a tu alrededor.',
  ],
  bicho: 'Un asqueroso bicho se fija en ti nada mas verte.',
  buitre: 'Un buitre carronyero esta aqui.',
  calamar: 'Un calamar gigante esta aqui nadando.',
  caracol: 'Un pequenyo caracol esta aqui haciendo trompos.',
  ciervo: null,
  ciudadano:
    'El pobre ciudadano esta tan absorto en su pena que no te advierte.',
  cliente:
    'Un cliente muy serio se sienta silenciosamente en una de las grandes mesas.',
  conejo: null,
  criatura: [
    'Una poderosa criatura del pantano esta aqui profundamente dormido.',
  ],
  cubo: 'Un enorme cubo transparente de materia gelatinosa rezuma ante ti.',
  cultista: [
    'Una joven cultista parece bastante serena, mientras no vea a nadie m',
  ],
  dragon: null,
  empleado: null,
  engendro:
    'Un deforme humano, un engendro de la magia, quiere descargar su agresividad.',
  espiritu: 'Un espíritu se desliza por el aire.',
  esqueleto: [
    'El esqueleto hace castanyetear sus dientes amenazadoramente y se acerca!',
    'Un esqueleto con armadura avanza torpemente a traves de los arboles.',
    'Un esqueleto huesudo esta aqui profundamente dormido.',
    'Un esqueleto polvoriento esta aqui.',
  ],
  fanatico: "Un humano poseído por el fanatismo busca 'herejes'.",
  gusano: [
    'Un gusano de roca esta aqui profundamente dormido.',
    /Un monstruoso gusano de hielo excava a traves del hielo y la nieve aqui\. Se yergue y\s+ataca!/,
  ],
  hobgoblin: [
    'un guardia hobgoblin de elite esta aqui profundamente dormido.',
    'Un hobgoblin armado esta aqui, interrogando a un prisionero.',
    'Un macizo hobgoblin esta de guardia cerca del hueco de la escalera.',
    'Un guardian de la montaña esta aquí, echando espuma por la boca.',
  ],
  gnoll: 'un gnoll feo esta aqui profundamente dormido.',
  goblin: [
    'un goblin negrero esta aqui profundamente dormido.',
    'Un habitante del bosque merodea por aqui, protegiendo su montanya.',
    'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
  ],
  atontada: 'Una granjera atontada mira hacia ningun lugar.',
  atontado: 'Un granjero atontado tropieza por aqui.',
  guardia: [
    'Un Guardia Real está aquí velando por la seguridad del estadio',
    'Un guardia del pueblo vaga a ciegas.',
  ],
  guerrero: 'Un guerrero asqueroso grunye al verte.',
  jefe: [
    'Un jefe esta aqui descansando.',
    'Un jefe orco esta aqui mirandote desconfiado.',
    'Un macizo chaman goblin esta aqui rugiendo a sus lacayos.',
  ],
  ladron: [
    'Una extraña figura se mueve furtivamente.',
    'Un ladron esta aqui profundamente dormido.',
    'Un ladron te mira desconfiado.',
    /Tu ataque causa .* a un ladron!/,
  ],
  lobo: [
    'Un gran lobo negro, te muestra los colmillos hambriento.',
    'Un lobo feroz esta aqui y grunye muy enojado.',
    'Un lobo hambriento te esta mirando',
  ],
  mago: [
    'Un mago viejo esta aqui profundamente dormido.',
    'Un anciano con ropajes de mago, pregona sus mercancias.',
  ],
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
    'El orco espadachin llega desde el este.',
    'Un asqueroso arquero orco esta aqui.',
    'Un corpulento orco esta aqui de guardia.',
    'un guardia orco esta aqui profundamente dormido.',
    'Un jefe orco esta aqui profundamente dormido.',
    'Un ogro centinela esta de guardia delante de la puerta norte.',
    'un orco centinela esta aqui profundamente dormido.',
    'Un orco esta de pie al lado de la ballesta.',
    'Un orco fuera de servicio esta sentado aqui jugando a las cartas.',
    'Un orco fuera de servicio esta sentado aqui jugando a los dados.',
    'un orco minero esta aqui profundamente dormido.',
    'Un pequenyo orco se sienta en una de las sillas roncando.',
    'Un sargento orco mantiene vigilada la chusma a la que comanda.',
    'Un voluminoso cocinero orco sopesa un cuchillo de carnicero manchado de sangre.',
    /El orco espadachin esta aqui profundamente dormido\./i,
  ],
  oso:
    'Un oso pardo se mueve pesadamente detras de la mesa, hay sangre en su piel.',
  pantera: null,
  piranya: [
    'Una piranya te mira con su enorme boca.',
    /Una piranya esta aqui profundamente dormido\./i,
  ],
  rata: 'Una rata gigante esta aqui profundamente dormido.',
  sapo: 'un sapo gigante esta aqui profundamente dormido.',
  sacerdotisa:
    'Una voluptuosa mujer desnuda se postra ante su dios lujuriosamente.',
  serpiente: 'Una serpiente que parece venenosa te mira fijamente.',
  'uruk-hai': [
    'Un asqueroso arquero uruk-hai tensa su arco al verte.',
    'Un superior uruk-hai esta aqui vigilando.',
  ],
  troll: 'Un troll de mas de 3 metros de alto esta destrozando el mobiliario.',
  viejo: 'Un harapiento y despeinado viejo llora sentado en el suelo.',
  zombie: 'Un zombie se acerca hacia ti con los brazos extendidos.',
};

const MOB_CHARACTERS = {
  clegg:
    'El carnicero demente saca espuma por la boca mientras parte la carne.',
  kivon: 'Kivon, el líder del culto, no está nada contento con intromisiones.',
  mariah: 'Una joven esta aqui sentada y canta suavemente para si.',
  nejane: 'Nejane, la líder, parece estar en trance.',
  silus:
    'Un delgado elfo, el propietario del establecimiento, te mira fijamente.',
} as const;

const MOB_ARTICLE = /(?:(?:un|una|el|la|los|las|unos|unas) )?/;
const MOB_NAME = /(?<mob>(?: |\w|-)+)/;
const ALLIES = ['armadillo', 'lince'];

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

export interface Mob {
  name: MobName;
  presence?: Pattern | null;
}

export const ATTACK_RECEIVED = [
  /Tu ataque \w+ a un (?<mob>ladron)./,
  concatRegexes(/El \w+ de /, MOB_ARTICLE, MOB_NAME, / te /),
];

export const MOB_ARRIVES = concatRegexes(
  MOB_ARTICLE,
  MOB_NAME,
  / llega desde el (?<direction>\w+)/,
);

export const MOB_LEAVES = concatRegexes(
  MOB_ARTICLE,
  MOB_NAME,
  / (?:se va)|(?:vuela) hacia (?:el )?(?<direction>\w+)/,
);

export const MOB_DIES = concatRegexes(MOB_ARTICLE, MOB_NAME, / ha MUERTO!!/);

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
