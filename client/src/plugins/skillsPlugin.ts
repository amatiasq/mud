import {
  Casteable,
  getSpell,
  SkillName,
  Spell,
  SPELL_ALREADY_APPLIED,
  SPELL_FAILED,
  SPELL_NOT_POSSIBLE,
} from '../data/spells';
import { createPlugin } from '../lib/createPlugin';
import { CancellablePromise } from '../lib/util/CancellablePromise';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';
import { singleExecution } from '../lib/util/singleExecution';

// Skill cast results
// const TIMEOUT = 0;
const NOT_AVAILABLE = undefined;
const BUSY = null;
const FAILED = false;
const CASTED = true;
const ALREADY_APPLIED = 1;

export type CastSpellResult =
  | typeof NOT_AVAILABLE
  | typeof BUSY
  | typeof FAILED
  | typeof CASTED
  | typeof ALREADY_APPLIED;

export type MeditationResult =
  | typeof NOT_AVAILABLE
  | typeof BUSY
  | typeof FAILED
  | typeof CASTED;

const SKILL = /((?:\w+ )+)\s+(\d+)%/g;
const SKILLS_DETECTOR = concatRegexes(
  /-+\[(\w+)\]-+\n/,
  /(.|\n)+/,
  /Te quedan /,
  int('practices'),
  / practicas?.\n/,
  /Tienes /,
  int('trainings'),
  / entrenamientos?.\n/,
);

export const skillsPlugin = createPlugin(
  ({ when, write }) => {
    let isInitialized = false;
    let practices = 0;
    let trainings = 0;
    let skills: Record<string, number> = {};

    const refresh = singleExecution(() => {
      write('practicar');
      return when(SKILLS_DETECTOR);
    });

    when(/HAS SUBIDO A NIVEL \d+!!!!!! :)/, () => (isInitialized = false));

    when(
      SKILLS_DETECTOR,
      ({ captured: [content], groups }) => {
        practices = toInt(groups.practices);
        trainings = toInt(groups.trainings);

        for (const skill of content.matchAll(SKILL)!) {
          skills[skill[1].trim()] = parseInt(skill[2], 10);
        }

        isInitialized = true;
      },
      { captureLength: 5000 },
    );

    return {
      getPractices: () => practices,
      getTrainings: () => trainings,
      getSkills: () => skills,

      refresh,

      async ensureInitiated() {
        if (!isInitialized) {
          await refresh();
        }
      },
    };
  },
  ({ getPractices, getTrainings, getSkills, refresh, ensureInitiated }) =>
    ({ when, write }) => {
      let isSpellRunning = false;
      let isMeditating = false;

      return {
        get practices() {
          return ensureInitiated().then(getPractices);
        },
        get trainings() {
          return ensureInitiated().then(getTrainings);
        },

        can,
        canLearn,
        castSpell,
        getPractices,
        getTrainings,
        refresh,
        meditate,
        polimorfar,
        NOT_AVAILABLE,
        BUSY,
        FAILED,
        CASTED,
        ALREADY_APPLIED,
      };

      async function can(search: SkillName | SkillName[]) {
        await ensureInitiated();

        if (typeof search === 'string') {
          return hasSync(search) ? search : null;
        } else {
          return search.find(hasSync) || null;
        }
      }

      function hasSync(name: string) {
        return getSkills()[name];
      }

      async function canLearn(name: string) {
        await ensureInitiated();
        return name in getSkills();
      }

      async function meditate() {
        if (!(await can('meditar'))) return NOT_AVAILABLE;
        if (isSpellRunning) return BUSY;
        if (isMeditating) return waitResponse();

        isMeditating = true;
        write('meditar');
        return waitResponse().finally(() => (isMeditating = false));

        function waitResponse() {
          return when.any(
            when(
              'Meditas con total paz interior, recolectando mana del cosmos.',
            ).then(() => CASTED),
            when(
              'Te pasas varios minutos en profunda concentracion, pero fallas en el intento de recolectar mana.',
            ).then(() => FAILED),
          );
        }
      }

      async function castSpell(name: Casteable, args = '') {
        const aliases = Array.isArray(name) ? name : [name];
        const candidates = aliases.map(getSpell).filter(Boolean) as Spell[];

        const learnt = await can(candidates.map(x => x.name));
        if (!learnt) return NOT_AVAILABLE;

        const spell = candidates.find(x => x.name === learnt)!;
        const success = args ? spell.target : spell.success;

        if (!success) {
          throw new Error(
            `Unknown response for spell "${name}" (${spell.name}).` +
              (args ? ` With target "${args}"` : ''),
          );
        }

        if (isSpellRunning || isMeditating) {
          return BUSY;
        }

        const canCreateBerry = await can('crear baya');
        isSpellRunning = true;
        write(`conjurar "${spell.name}" ${args}`);

        const promises: CancellablePromise<CastSpellResult>[] = [
          when(success).then(() => CASTED),
          // when('Falta algo...').then(() => )
          when(SPELL_NOT_POSSIBLE).then(() => NOT_AVAILABLE),
          when(SPELL_ALREADY_APPLIED).then(() => ALREADY_APPLIED),
          when(SPELL_FAILED)
            .wait(4)
            .then(() => FAILED),
        ];

        if (spell.target) {
          promises.push(when(spell.target).then(() => CASTED));
        }

        const result = await when.any(...promises);
        isSpellRunning = false;
        return result;
      }

      async function polimorfar(level: number) {
        const options: [number, string][] = [
          [20, 'Gato'],
          [23, 'Aguila'],
          [25, 'Serpiente'],
          [30, 'Lobo'],
          [35, 'Tortuga'],
          [40, 'Cocodrilo'],
          [45, 'Oso'],
          [50, 'Pegaso'],
          [55, 'Elem aire'],
          [60, 'Elem tierra'],
          [65, 'Ent'],
        ];

        const target = options
          .reverse()
          .find(([minLevel]) => level >= minLevel);
        return target && castSpell('polimorfar', target[1]);
      }
    },
);
