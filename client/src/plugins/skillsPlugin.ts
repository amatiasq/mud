import { PluginContext } from '../lib/PluginContext';
import { concatRegexes } from '../lib/util/concatRegexes';
import { singleExecution } from '../lib/util/singleExecution';

const UNKNOWN = 'UNKNOWN_STRING_THAT_SHOULD_NEVER_MATCH';

const MISSED = 'Has fallado.';

const FAILURE = [
  'Algo te distrae y pierdes la concentracion.',
  'Has perdido la concentracion.',
  'Has tenido una laguna mental mientras invocabas el hechizo.',
  'Pierdes la concentracion.',
  'Un picor en la nariz te impide mantener la concentracion.',
  'Un pinchazo en tu pierna te impide lanzar el conjuro adecuadamente.',
  'Una mota de polvo en el ojo rompe tu concentracion por un momento.',
];

const NOT_POSSIBLE = [
  'No tienes suficiente mana.',
  'Este estilo de lucha pide demasiado atencion para hacer eso!',
  'Este asalto del combate es demasiado febril para concentrarte adecuadamente.',
];

// prettier-ignore
const SUCCESS = {
  'armadura': 'Tu armadura brilla suavemente al ser mejorada por un conjuro.',
  'bendecir': 'Tu dios te otorga una poderosa bendicion.',
  'causar grave': /Tu conjuro [^\n]+ a( w+)+!/,
  'ceguera': /Lanzas un conjuro de ceguera contra ([^.]+)./,
  'crear agua': ' esta lleno.\n',
  'crear comida': 'Una seta magica aparece de repente.',
  'crear fuego': 'Una gran hoguera se enciende en el suelo delante tuyo.',
  'crear manantial': 'Trazas un circulo delante tuyo del cual emerge un manantial de agua cristalina.',
  'curar ceguera': UNKNOWN,
  'curar leves': 'Tus heridas leves se cierran y el dolor desaparece.',
  'detectar escondido': 'Tus sentidos cobran la viveza de los del mejor predador.',
  'detectar invisible': 'Tus ojos brillan, siendo capaces ahora de ver lo invisible.',
  'detectar magia': 'Delgadas lineas azules reseguiran las siluetas de los objetos magicos que te encuentres.',
  'flotar': 'Empiezas a flotar a unos centimetros del suelo...',
  'invisibilidad': 'Te desvaneces en el aire.',
  'invocar armadillo': 'Agitas tus brazos a la vez que te concentras para invocar un pequenyo armadillo.',
  'luz eterna': 'Rayos de luz iridiscente colisionan para formar una bola de luz eterna...',
  'refrescar': 'Nueva vitalidad fluye hacia ti.',
  'volar':'Te elevas entre las corrientes de aire...',
};

const LEARN = ['crear comida', 'crear manantial', 'armadura', 'bendecir'];

// Skill cast results
// const TIMEOUT = 0;
const NOT_AVAILABLE = undefined;
const BUSY = null;
const FAILED = false;
const CASTED = true;

const SKILL = /((?:\w+ )+)\s+(\d+)%/g;
const SKILLS_DETECTOR = concatRegexes(
  /-+\[(\w+)\]-+\n/,
  /(.|\n)+/,
  /Te quedan \d+ practicas.\n/,
  /Tienes \d+ entrenamientos.\n/,
);

export function skillsPlugin({ when, write }: PluginContext) {
  let isInitialized = false;
  let isSpellRunning = false;
  let skills: Record<string, number> = {};

  const refresh = singleExecution(() => {
    write('practicar');
    return when(SKILLS_DETECTOR);
  });

  when(
    SKILLS_DETECTOR,
    ({ captured: [content] }) => {
      isInitialized = true;

      for (const skill of content.matchAll(SKILL)!) {
        skills[skill[1].trim()] = parseInt(skill[2], 10);
      }

      isInitialized = true;
    },
    { captureLength: 3000 },
  );

  return { has, canLearn, castSpell, NOT_AVAILABLE, BUSY, FAILED, CASTED };

  async function has(search: string | string[]) {
    await ensureInitiated();

    if (typeof search === 'string') {
      return hasSync(search) ? search : null;
    } else {
      return search.find(hasSync) || null;
    }
  }

  function hasSync(name: string) {
    return skills[name];
  }

  async function canLearn(name: string) {
    await ensureInitiated();
    return name in skills;
  }

  function ensureInitiated() {
    if (!isInitialized) {
      return refresh();
    }
  }

  async function castSpell(name: string | string[], args = '') {
    const validName = await has(name);

    if (!validName) {
      return NOT_AVAILABLE;
    }

    if (!(validName in SUCCESS)) {
      throw new Error(`Unknown response for spell "${name}".`);
    }

    if (isSpellRunning) {
      return BUSY;
    }

    isSpellRunning = true;
    write(`conjurar "${validName}" ${args}`);

    const success = SUCCESS[validName as keyof typeof SUCCESS];

    const result = await Promise.any([
      when(success).then(() => CASTED),
      when(MISSED).then(() => NOT_AVAILABLE),
      when(FAILURE)
        .wait(8)
        .then(() => FAILED),
    ]);

    isSpellRunning = false;
    return result;
  }
}
