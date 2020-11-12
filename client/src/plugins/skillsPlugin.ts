import {
  getSpells,
  SPELL_ALREADY_APPLIED,
  SPELL_FAILED,
  SPELL_NOT_POSSIBLE,
} from '../data/spells';
import { PluginContext } from '../lib/PluginContext';
import { concatRegexes } from '../lib/util/concatRegexes';
import { singleExecution } from '../lib/util/singleExecution';

// Skill cast results
// const TIMEOUT = 0;
const NOT_AVAILABLE = undefined;
const BUSY = null;
const FAILED = false;
const CASTED = true;
const ALREADY_APPLIED = 1;

const SUCCESS = Object.fromEntries(getSpells().map(x => [x.name, x.success]));

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

      console.log(skills);
    },
    { captureLength: 5000 },
  );

  return {
    has,
    canLearn,
    castSpell,
    NOT_AVAILABLE,
    BUSY,
    FAILED,
    CASTED,
    ALREADY_APPLIED,
  };

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
      when(SPELL_NOT_POSSIBLE).then(() => NOT_AVAILABLE),
      when(SPELL_ALREADY_APPLIED).then(() => ALREADY_APPLIED),
      when(SPELL_FAILED)
        .wait(4)
        .then(() => FAILED),
    ]);

    isSpellRunning = false;
    return result;
  }
}
