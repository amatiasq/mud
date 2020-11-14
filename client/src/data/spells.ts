import { Pattern } from './../lib/triggers/Pattern';
import { spellList, SpellName, SpellBase } from './skills';

interface SpellMetadata {
  readonly success: Pattern;
  readonly target?: Pattern | false;
  readonly endEffect?: Pattern;
  readonly dope?: true | readonly SpellName[];
  readonly afterDope?: string | readonly string[];
}

export type Casteable = SpellName | SpellName[];
export type Spell = SpellBase & SpellMetadata;

// export const UNKNOWN = null;
// export type UNKNOWN = typeof UNKNOWN;

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
  attack: ['causar critica', 'causar grave', 'causar leve'],
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

  return (
    base && {
      ...base,
      ...(metadata[base.name] || {}),
    }
  );
}

const metadata: Partial<Record<SpellName, SpellMetadata>> = {
  armadura: {
    success: 'Tu armadura brilla suavemente al ser mejorada por un conjuro.',
    target: /La armadura de (?<target>(?:\w+ )+)brilla suavemente al ser mejorada por un conjuro\./,
    endEffect: 'Tu armadura vuelve a su valor normal.',
    dope: true,
  },

  bendecir: {
    success: 'Tu dios te otorga una poderosa bendicion.',
    endEffect: 'La bendicion desaparece.',
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
    endEffect: 'Un manantial magico se seca.',
  },

  'curar graves': {
    success: 'Tus heridas graves se cierran y el dolor desaparece.',
  },

  'curar leves': {
    success: 'Tus heridas leves se cierran y el dolor desaparece.',
  },

  'detectar escondido': {
    success: 'Tus sentidos cobran la viveza de los del mejor predador.',
    target: false,
    endEffect: 'Te sientes menos consciente de lo que te rodea.',
    dope: true,
  },

  'detectar invisible': {
    success: 'Tus ojos brillan, siendo capaces ahora de ver lo invisible.',
    target: false,
    endEffect: 'Ya no ves objetos invisibles.',
    dope: true,
  },

  'detectar magia': {
    success:
      'Delgadas lineas azules reseguiran las siluetas de los objetos magicos que te encuentres.',
    target: false,
    endEffect: 'Las lineas azules desaparecen de tu vision',
    dope: true,
  },

  'detectar maldad': {
    success:
      'Delgadas lineas rojas reseguiran las siluetas de los seres malvados que te encuentres.',
    target: false,
    endEffect: 'Las lineas rojas desaparecen de tu vision.',
    dope: true,
  },

  'detectar trampas': {
    success: 'De repente te sientes mas alerta de los peligros que te rodean.',
    target: false,
    endEffect: 'Te sientes menos alerta de los peligros que te rodean.',
    dope: true,
  },

  flotar: {
    success: 'Empiezas a flotar a unos centimetros del suelo...',
    endEffect: 'Tus pies aterrizan suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },

  identificar: {
    success: /El objeto '(?<name>[^']+)' es un\(a\) (?<type>\w+), propiedades especiales: (?<properties>[^\n]+)\n/,
  },

  invisibilidad: {
    success: 'Te desvaneces en el aire.',
    target: /(?<target>(?:\w+ )+)se desvanece en el aire./,
    endEffect: 'Ya no eres invisible.',
    dope: true,
  },

  'invocar armadillo': {
    success:
      'Agitas tus brazos a la vez que te concentras para invocar un pequenyo armadillo.',
    // endEffect: UNKNOWN,
  },

  'luz eterna': {
    success:
      'Rayos de luz iridiscente colisionan para formar una bola de luz eterna...',
    endEffect: 'Esta completamente oscuro ...',
    afterDope: ['vestir luz', 'mirar'],
  },

  'piel robliza': {
    success: 'Tu piel se oscurece a la vez que adquiere la dureza del roble.',
    target: false,
    endEffect: 'Tu piel vuelve a su estado normal...',
    dope: true,
  },

  refrescar: {
    success: 'Nueva vitalidad fluye hacia ti.',
  },

  volar: {
    success: 'Te elevas entre las corrientes de aire...',
    target: /(?<target>(?:\w+ )+)se eleva entre las corrientes de aire.../,
    endEffect: 'Aterrizas suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },
};

const spells = spellList.map(x => ({
  ...x,
  ...(metadata[x.name] || {}),
})) as Spell[];
