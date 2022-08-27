import { SKILL_LEARN_ORDER } from '../data/skills_order';
import { SkillName } from '../data/spells';
import { Context } from '../lib';

export async function learn(
  { when, write, plugins: { navigation, skills } }: Context,
  ...parts: string[]
) {
  let practicesLeft = await skills.practices;

  if (!practicesLeft) {
    console.warn('No practices left');
    return;
  }

  const arg = parts.join(' ') as SkillName;

  if (arg) {
    if (await skills.can(arg)) {
      console.warn(`${arg} already known!`);
      return;
    }

    return goPractice(() => practice(arg));
  }

  const next = await getNextSkills();

  if (!next.length) {
    console.warn('Nothing to learn');
    return;
  }

  return goPractice(async () => {
    for (const skill of next) {
      await practice(skill);
      practicesLeft--;

      if (!practicesLeft) {
        break;
      }
    }

    return skills.refresh();
  });

  async function goPractice(action: () => Promise<any>) {
    await navigation.execute('rdnne');
    await action();
    await navigation.execute('wssu');
  }

  async function practice(skill: SkillName) {
    write(`practicar ${skill}`);
    await when('Ahora deberas practicarlo por tu cuenta...');
  }

  async function getNextSkills() {
    const following: SkillName[] = [];

    for (const skill of SKILL_LEARN_ORDER) {
      if (!Array.isArray(skill)) {
        if (await isLearnable(skill)) {
          following.push(skill);
        }
        continue;
      }

      for (const single of skill) {
        if (await skills.can(single)) {
          break;
        }

        if (await skills.canLearn(single)) {
          following.push(single);
          break;
        }
      }
    }

    return following;
  }

  async function isLearnable(skill: SkillName) {
    if (await skills.can(skill)) {
      return false;
    }

    return skills.canLearn(skill);
  }
}
