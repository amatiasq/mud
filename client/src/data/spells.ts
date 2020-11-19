import { Pattern } from '../lib/triggers/Pattern';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int } from '../lib/util/int';
import ALL_SKILLS from './skills.json';

type Item = typeof ALL_SKILLS[number];

// prettier-ignore-start
export const languageList = ALL_SKILLS.filter(
  x => x.type === 'Idioma',
) as LanguageBase[];
export const skillList = ALL_SKILLS.filter(
  x => x.type === 'Habilidad',
) as SkillBase[];
export const spellList = ALL_SKILLS.filter(
  x => x.type === 'Hechizo',
) as SpellBase[];
export const weaponList = ALL_SKILLS.filter(
  x => x.type === 'Arma',
) as WeaponBase[];
// prettier-ignore-end

export type LanguageBase = Extract<Item, { type: 'Idioma' }>;
export type SkillBase = Extract<Item, { type: 'Habilidad' }>;
export type SpellBase = Extract<Item, { type: 'Hechizo' }>;
export type WeaponBase = Extract<Item, { type: 'Arma' }>;

export type SkillName = Item['name'];

export type LanguageName = LanguageBase['name'];
export type SpellName = SpellBase['name'];
export type WeaponName = WeaponBase['name'];

const effectDuration = (name: SpellName) =>
  concatRegexes(
    /Hechizo  : '/,
    name,
    /'  durante /,
    int('asaltos'),
    / asaltos./,
  );

const effectProp = (prop: string | RegExp) => (name: SpellName) =>
  concatRegexes(
    /Hechizo  : '/,
    name,
    /' Afecta /,
    prop,
    / en /,
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
    effect: effectProp('armor class'),
  },

  'atravesar puerta': {
    success: 'Te vuelves translucido.',
    end: 'Vuelves a tener un cuerpo solido.',
    effect: effectDuration,
  },

  bendecir: {
    success: 'Tu dios te otorga una poderosa bendicion.',
    end: 'La bendicion desaparece.',
    effect: effectProp('hit roll'),
  },

  'causar critica': { target: /Tu conjuro [^\n]+ a(?<target>(?: \w+)+)!/ },
  'causar grave': { target: /Tu conjuro [^\n]+ a(?<target>(?: \w+)+)!/ },
  'causar leve': { target: /Tu conjuro [^\n]+ a(?<target>(?: \w+)+)!/ },
  ceguera: { target: /Lanzas un conjuro de ceguera contra (?<target>[^.]+)./ },
  'crear agua': { target: ' esta lleno.\n' },

  'crear baya': {
    success: 'Una baya brillante y dorada aparece en tus manos!',
  },

  'crear comida': { success: 'Una seta magica aparece de repente.' },

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
    target: /Curas las heridas mas graves de (?<target>[^\.]+)\./,
  },

  'curar graves': {
    success: 'Tus heridas graves se cierran y el dolor desaparece.',
    target: /Curas las heridas graves de (?<target>[^\.]+)\./,
  },

  'curar leves': {
    success: 'Tus heridas leves se cierran y el dolor desaparece.',
    target: /Curas las heridas leves de (?<target>[^\.]+)\./,
  },

  'curar veneno': {
    success: 'Un agradable sensacion recorre tu cuerpo.',
  },

  'detectar escondido': {
    success: 'Tus sentidos cobran la viveza de los del mejor predador.',
    end: 'Te sientes menos consciente de lo que te rodea.',
    effect: effectDuration,
  },

  'detectar invisible': {
    success: 'Tus ojos brillan, siendo capaces ahora de ver lo invisible.',
    end: 'Ya no ves objetos invisibles.',
    effect: effectDuration,
  },

  'detectar magia': {
    success:
      'Delgadas lineas azules reseguiran las siluetas de los objetos magicos que te encuentres.',
    end: 'Las lineas azules desaparecen de tu vision',
    effect: effectDuration,
  },

  'detectar maldad': {
    success:
      'Delgadas lineas rojas reseguiran las siluetas de los seres malvados que te encuentres.',
    effect: effectDuration,
    end: 'Las lineas rojas desaparecen de tu vision.',
  },

  'detectar trampas': {
    success: 'De repente te sientes mas alerta de los peligros que te rodean.',
    end: 'Te sientes menos alerta de los peligros que te rodean.',
    effect: effectDuration,
  },

  flotar: {
    success: 'Empiezas a flotar a unos centimetros del suelo...',
    target: /\n(?<target>[^\n]+) empieza a flotar a unos centimetros del suelo\.\.\./,
    end: 'Tus pies aterrizan suavemente en el suelo.',
  },

  'fuerza vampirica': {
    success: 'La fuerza de los vampiros fluye por tus venas...',
    effect: effectProp('fuerza'),
  },

  'furia naturaleza': {
    success: 'Sientes como la furia de la naturaleza te embarga...',
  },

  identificar: {
    target: /El objeto '(?<name>[^']+)' es un\(a\) (?<type>\w+), propiedades especiales: (?<properties>[^\n]+)\n/,
  },

  invisibilidad: {
    success: 'Te desvaneces en el aire.',
    target: /\n(?<target>[^\n]+) se desvanece en el aire./,
    end: 'Ya no eres invisible.',
    effect: effectDuration,
  },

  'invisibilidad grupo': {
    success:
      'Tu cuerpo se vuelve traslucido por un momento y luego se desvanece.',
  },

  'invocar armadillo': {
    success:
      'Agitas tus brazos a la vez que te concentras para invocar un pequenyo armadillo.',
  },

  'luz eterna': {
    success:
      'Rayos de luz iridiscente colisionan para formar una bola de luz eterna...',
  },

  'piel robliza': {
    success: 'Tu piel se oscurece a la vez que adquiere la dureza del roble.',
    end: 'Tu piel vuelve a su estado normal...',
    effect: effectProp('armor class'),
  },

  polimorfar: {
    success: /Tu cuerpo empieza a cambiar... hasta transformarte en (?<result>[^!]+)!/,
    end: 'Recuperas tu forma natural.',
  },

  refrescar: { success: 'Nueva vitalidad fluye hacia ti.' },

  'respiracion acuatica': {
    success: 'Tus pulmones ahora son capaces de respirar bajo agua...',
    target: /Los pulmones de (?<target>[^\n]+) ahora son capaces de respirar bajo agua\.\.\./,
    end: 'Tus pulmones vuelven a su estado original.',
    effect: effectDuration,
  },

  terremoto: {
    success: 'La tierra tiembla bajo tus pies!',
    target: 'La tierra tiembla bajo tus pies!',
  },

  veneno: {
    target: /\n(?<target>[^\n]+)cobra un aspecto enfermizo cuando tu veneno se esparce por su cuerpo./,
  },

  'vista distancia': {
    success: 'Tienes una vision reveladora...',
    target: /Los ojos de (?<target>[^\n]+) parecen estar mirando un lugar lejano\.\.\./,
    effect: effectDuration,
  },

  volar: {
    success: 'Te elevas entre las corrientes de aire...',
    target: /\n(?<target>[^\n]+) se eleva entre las corrientes de aire.../,
    end: 'Aterrizas suavemente en el suelo.',
    effect: effectDuration,
  },
};

const spells = spellList.map(x => ({
  ...x,
  ...(metadata[x.name] || {}),
})) as Spell[];

interface SpellMetadata {
  readonly success?: Pattern;
  readonly target?: Pattern;
  readonly end?: Pattern;
  readonly effect?: (string: SpellName) => Pattern;
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
  'Falta algo...',
  'No tienes suficiente mana.',
  'Sobre que quieres lanzar este conjuro?',
  'No puedes encontrar ningun ',
  'Este estilo de lucha pide demasiado atencion para hacer eso!',
  'Este asalto del combate es demasiado febril para concentrarte adecuadamente.',
  'No has tenido suficiente tiempo en este asalto para completar el conjuro.',
  'Estas demasiado malherido para hacer eso.',
  'Estas demasiado aturdido para hacer eso.',
];

export const SPELLS_BY_TYPE = {
  food: ['saciar hambre', 'crear comida'] as Casteable,
  water: ['crear manantial', 'crear agua'] as Casteable,
  movement: ['volar', 'flotar'] as Casteable,
  heal: ['curar criticas', 'curar graves', 'curar leves'] as Casteable,
  invisibility: ['invisibilidad grupo', 'invisibilidad'] as Casteable,
  massAttack: ['terremoto'] as Casteable,
  attack: ['causar critica', 'causar grave', 'causar leve'] as Casteable,

  attackAlternative: [
    'agarron impactante',
    'relampago',
    'bola fuego',
    'misil magico',
  ] as Casteable,

  dedope: [
    'ceguera',
    'veneno',
    'disipar magia',
    'disipar maldad',
    'maldecir',
    'proteccion',
    'fuego espectral',
    'debilitar',
  ] as Casteable,

  pet: [
    'invocar oso',
    'invocar jaguar',
    'invocar lobo',
    'invocar aguila',
    'invocar lince',
    'invocar armadillo',
  ] as Casteable,
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
  SPELLS_BY_TYPE.movement,

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
