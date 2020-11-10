export type SpellName = keyof typeof SPELLS;
export type Spell = SpellName | SpellName[];

export const UNKNOWN = null;
export type UNKNOWN = typeof UNKNOWN;

export const SPELL_FAILED = [
  'Algo te distrae y pierdes la concentracion.',
  'Has perdido la concentracion.',
  'Has tenido una laguna mental mientras invocabas el hechizo.',
  'Pierdes la concentracion.',
  'Un picor en la nariz te impide mantener la concentracion.',
  'Un pinchazo en tu pierna te impide lanzar el conjuro adecuadamente.',
  'Una mota de polvo en el ojo rompe tu concentracion por un momento.',
];

export const SPELL_NOT_POSSIBLE = [
  'Has fallado.',
  'No tienes suficiente mana.',
  'Este estilo de lucha pide demasiado atencion para hacer eso!',
  'Este asalto del combate es demasiado febril para concentrarte adecuadamente.',
];

export const SPELLS_BY_TYPE: Record<string, Spell> = {
  food: ['crear baya', 'crear comida'],
  water: ['crear manantial', 'crear agua'],
  levitate: ['volar', 'flotar'],
  heal: ['curar criticas', 'curar grave', 'curar leves'],
  attack: ['causar critica', 'causar grave', 'causar leve'],
  dedope: ['ceguera', 'veneno'],
};

export const SPELL_LEARN_ORDER: Spell[] = [
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

export interface SpellDescription {
  name: SpellName;
  success: string | RegExp;
  endEffect?: string | UNKNOWN;
  dope?: boolean | SpellName[];
}

export function getSpells(): SpellDescription[] {
  return Object.entries(SPELLS)
    .filter(([name, desc]) => desc)
    .map(([name, desc]) => ({
      ...((desc as any) as Omit<SpellDescription, 'name'>),
      name: name as SpellName,
    }));
}

const SPELLS = {
  armadura: {
    success: 'Tu armadura brilla suavemente al ser mejorada por un conjuro.',
    endEffect: 'Tu armadura vuelve a su valor normal.',
    dope: true,
  },

  bendecir: {
    success: 'Tu dios te otorga una poderosa bendicion.',
    endEffect: UNKNOWN,
  },

  'causar critica': UNKNOWN,

  'causar grave': {
    success: /Tu conjuro [^\n]+ a( w+)+!/,
  },

  'causar leve': UNKNOWN,

  ceguera: {
    success: /Lanzas un conjuro de ceguera contra ([^.]+)./,
  },

  'conocer alineamiento': UNKNOWN,

  'crear agua': {
    success: ' esta lleno.\n',
  },

  'crear baya': UNKNOWN,

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
    dope: true,
  },

  'curar ceguera': UNKNOWN,
  'curar criticas': UNKNOWN,
  'curar grave': UNKNOWN,

  'curar leves': {
    success: 'Tus heridas leves se cierran y el dolor desaparece.',
  },

  'detectar escondido': {
    success: 'Tus sentidos cobran la viveza de los del mejor predador.',
    endEffect: UNKNOWN,
    dope: true,
  },

  'detectar invisible': {
    success: 'Tus ojos brillan, siendo capaces ahora de ver lo invisible.',
    endEffect: 'Ya no ves objetos invisibles.',
    dope: true,
  },

  'detectar magia': {
    success:
      'Delgadas lineas azules reseguiran las siluetas de los objetos magicos que te encuentres.',
    endEffect: 'Las lineas azules desaparecen de tu vision',
    dope: true,
  },

  'detectar maldad': UNKNOWN,
  'detectar trampas': UNKNOWN,
  'disipar maldad': UNKNOWN,

  flotar: {
    success: 'Empiezas a flotar a unos centimetros del suelo...',
    endEffect: 'Tus pies aterrizan suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },

  'fuego espectral': UNKNOWN,

  invisibilidad: {
    success: 'Te desvaneces en el aire.',
    endEffect: 'Ya no eres invisible.',
    dope: true,
  },

  'invocar armadillo': {
    success:
      'Agitas tus brazos a la vez que te concentras para invocar un pequenyo armadillo.',
    endEffect: UNKNOWN,
    dope: true,
  },

  'llamar rayo': UNKNOWN,

  'luz eterna': {
    success:
      'Rayos de luz iridiscente colisionan para formar una bola de luz eterna...',
  },

  maldecir: UNKNOWN,
  'misil magico': UNKNOWN,
  'niebla espectral': UNKNOWN,
  proteccion: UNKNOWN,

  refrescar: {
    success: 'Nueva vitalidad fluye hacia ti.',
  },

  terremoto: UNKNOWN,
  veneno: UNKNOWN,

  volar: {
    success: 'Te elevas entre las corrientes de aire...',
    endEffect: 'Aterrizas suavemente en el suelo.',
    dope: ['volar', 'flotar'],
  },
};
