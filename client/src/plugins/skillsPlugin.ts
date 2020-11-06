import { PluginContext } from '../lib/PluginContext';
import { concatRegexes } from '../lib/util/concatRegexes';

const SKILL = /((?:\w+ )+)\s+(\d+)%/g;
const SKILLS_DETECTOR = concatRegexes(
  /-+\[(\w+)\]-+\n/,
  /(.|\n)+/,
  /Te quedan \d+ practicas.\n/,
  /Tienes \d+ entrenamientos.\n/,
);

export function skillsPlugin({ when, write }: PluginContext) {
  let isInitialized = false;
  let skills: Record<string, number> = {};

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

  return { has, canLearn };

  function refresh() {
    write('practicar');
    return when(SKILLS_DETECTOR);
  }

  async function has(name: string) {
    await ensureInitiated();
    return Boolean(skills[name]);
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
}
