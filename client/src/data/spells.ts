import { Pattern } from '../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int } from '../lib/util/int';
import { SpellBase, spellList, SpellName } from './skills';

const effectDuration = (name: SpellName) =>
  concatRegexes(
    /Hechizo  : '/,
    name,
    /'  durante /,
    int('asaltos'),
    / asaltos./,
  );

const effectArmorClass = (name: SpellName) =>
  concatRegexes(
    /Hechizo  : '/,
    name,
    /' Afecta armor class en /,
    int('cantidad'),
    / durante /,
    int('asaltos'),
    / asaltos./,
  );

const metadata: Partial<Record<SpellName, SpellMetadata>> = {
  armadura: {
    success: 'Tu armadura brilla suavemente al ser mejorada por un conjuro.',
    target: /La armadura de (?<target>(?:\w+ )+)brilla suavemente al ser mejorada por un conjuro\./,
    end: 'Tu armadura vuelve a su valor normal.',
    effect: effectArmorClass,
    dope: true,
  },

  bendecir: {
    success: 'Tu dios te otorga una poderosa bendicion.',
    end: 'La bendicion desaparece.',
  },

  'causar critica': {
    success: /Tu conjuro [^\n]+ a( w+)+!/,
  },

  'causar grave': {
    success: /Tu conjuro [^\n]+ a( w+)+!/,
  },

  'causar leve': {
    success: /Tu conjuro [^\n]+ a( w+)+!/,
  },

  ceguera: {
    success: /Lanzas un conjuro de ceguera contra ([^.]+)./,
  },

  'crear agua': {
    success: ' esta lleno.\n',
  },

  'crear comida': {
    success: 'Una seta magica aparece de repente.',
  },

  'crear fuego': {
    success: 'Una gran hoguera se enciende en el suelo delante tuyo.',
  },

  'crear manantial': {
    success:
      'Trazas un circulo delante tuyo del cual emerge un manantial de agua cristalina.',
    end: 'Un manantial magico se seca.',
  },

  'curar criticas': {
    success: 'Tus heridas mas graves se cierran y el dolor desaparece.',
  },

  'curar graves': {
    success: 'Tus heridas graves se cierran y el dolor desaparece.',
  },

  'curar leves': {
    success: 'Tus heridas leves se cierran y el dolor desaparece.',
  },

  'detectar escondido': {
    success: 'Tus sentidos cobran la viveza de los del mejor predador.',
    effect: effectDuration,
    target: false,
    end: 'Te sientes menos consciente de lo que te rodea.',
    dope: true,
  },

  'detectar invisible': {
    success: 'Tus ojos brillan, siendo capaces ahora de ver lo invisible.',
    effect: effectDuration,
    target: false,
    end: 'Ya no ves objetos invisibles.',
    dope: true,
  },

  'detectar magia': {
    success:
      'Delgadas lineas azules reseguiran las siluetas de los objetos magicos que te encuentres.',
    effect: effectDuration,
    target: false,
    end: 'Las lineas azules desaparecen de tu vision',
    dope: true,
  },

  'detectar maldad': {
    success:
      'Delgadas lineas rojas reseguiran las siluetas de los seres malvados que te encuentres.',
    effect: effectDuration,
    target: false,
    end: 'Las lineas rojas desaparecen de tu vision.',
    dope: true,
  },

  'detectar trampas': {
    success: 'De repente te sientes mas alerta de los peligros que te rodean.',
    effect: effectDuration,
    target: false,
    end: 'Te sientes menos alerta de los peligros que te rodean.',
    dope: true,
  },

  flotar: {
    success: 'Empiezas a flotar a unos centimetros del suelo...',
    end: 'Tus pies aterrizan suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },

  identificar: {
    success: /El objeto '(?<name>[^']+)' es un\(a\) (?<type>\w+), propiedades especiales: (?<properties>[^\n]+)\n/,
  },

  invisibilidad: {
    success: 'Te desvaneces en el aire.',
    effect: effectDuration,
    target: /(?<target>(?:\w+ )+)se desvanece en el aire./,
    end: 'Ya no eres invisible.',
    dope: true,
  },

  'invocar armadillo': {
    success:
      'Agitas tus brazos a la vez que te concentras para invocar un pequenyo armadillo.',
  },

  'luz eterna': {
    success:
      'Rayos de luz iridiscente colisionan para formar una bola de luz eterna...',
    end: 'Esta completamente oscuro ...',
    afterDope: ['vestir luz', 'mirar'],
  },

  'piel robliza': {
    success: 'Tu piel se oscurece a la vez que adquiere la dureza del roble.',
    effect: effectArmorClass,
    target: false,
    end: 'Tu piel vuelve a su estado normal...',
    dope: true,
  },

  refrescar: {
    success: 'Nueva vitalidad fluye hacia ti.',
  },

  'respiracion acuatica': {
    success: 'Tus pulmones ahora son capaces de respirar bajo agua...',
    dope: true,
  },

  terremoto: {
    success: 'La tierra tiembla bajo tus pies!',
  },

  veneno: {
    success: /(?<target>(?:\w| )+)cobra un aspecto enfermizo cuando tu veneno se esparce por su cuerpo./,
  },

  'vista distancia': {
    success: 'Tienes una vision reveladora...',
    dope: true,
  },

  volar: {
    success: 'Te elevas entre las corrientes de aire...',
    effect: effectDuration,
    target: /(?<target>(?:\w+ )+)se eleva entre las corrientes de aire.../,
    end: 'Aterrizas suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },
};

const spells = spellList.map(x => ({
  ...x,
  ...(metadata[x.name] || {}),
})) as Spell[];

interface SpellMetadata {
  readonly success: Pattern;
  readonly target?: Pattern | false;
  readonly effect?: Pattern | ((string: SpellName) => Pattern);
  readonly end?: Pattern;
  readonly dope?: true | readonly SpellName[];
  readonly afterDope?: string | readonly string[];
}

export type Casteable = SpellName | SpellName[];
export type Spell = SpellBase & SpellMetadata;

export const SPELL_FAILED = [
  'Algo te distrae y pierdes la concentracion.',
  'Has perdido la concentracion.',
  'Has tenido una laguna mental mientras invocabas el hechizo.',
  'Pierdes la concentracion.',
  'Un picor en la nariz te impide mantener la concentracion.',
  'Un pinchazo en tu pierna te impide lanzar el conjuro adecuadamente.',
  'Una mota de polvo en el ojo rompe tu concentracion por un momento.',
];

export const SPELL_ALREADY_APPLIED = [
  'Has fallado.',
  'Eso no parece tener ningun efecto.',
];

export const SPELL_NOT_POSSIBLE = [
  'No esta aqui.',
  'No tienes suficiente mana.',
  'Sobre que quieres lanzar este conjuro?',
  'No puedes encontrar ningun ',
  'Este estilo de lucha pide demasiado atencion para hacer eso!',
  'Este asalto del combate es demasiado febril para concentrarte adecuadamente.',
  'No has tenido suficiente tiempo en este asalto para completar el conjuro.',
  'Estas demasiado malherido para hacer eso.',
  'Estas demasiado aturdido para hacer eso.',
];

export const SPELLS_BY_TYPE: Record<string, Casteable> = {
  food: ['crear baya', 'crear comida'],
  water: ['crear manantial', 'crear agua'],
  levitate: ['volar', 'flotar'],
  heal: ['curar criticas', 'curar graves', 'curar leves'],
  attack: ['terremoto', 'causar critica', 'causar grave', 'causar leve'],
  massAttack: ['terremoto'],
  dedope: ['ceguera', 'veneno'],
};

export const SPELL_LEARN_ORDER: Casteable[] = [
  // Survival
  SPELLS_BY_TYPE.food,
  SPELLS_BY_TYPE.water,
  SPELLS_BY_TYPE.dedope,
  'luz eterna',

  // Love
  'invisibilidad',
  'invocar armadillo',

  // Dope
  'armadura',
  'bendecir',
  'detectar escondido',
  'detectar invisible',
  'detectar magia',
  SPELLS_BY_TYPE.levitate,

  // Medic
  'curar ceguera',
  SPELLS_BY_TYPE.heal,
  'refrescar',

  // Other
  SPELLS_BY_TYPE.attack,
  'crear fuego',
];

export function getSpells() {
  return spells;
}

export function getSpell(name: string) {
  const lower = name.toLowerCase();
  const base = spellList.find(x => x.name.startsWith(lower));

  if (!base) {
    throw new Error(`Unknown spell ${name}`);
  }

  const meta = base && metadata[base.name];
  if (!meta) return base;

  return {
    ...base,
    ...meta,
    effect:
      typeof meta.effect === 'function' ? meta.effect(base.name) : meta.effect,
  };
}
