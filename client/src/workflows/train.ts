import { getAreaMetadata, getAreasForLevel } from '../data/areas';
import { getMobIn, MOB_ARRIVES, MOB_LEAVES, MOB_PRESENT } from '../data/mobs';
import { Context } from '../lib/workflow/Context';

export async function train(
  {
    when,
    run: invokeWorkflow,
    plugins: { navigation: nav, prompt, stats },
  }: Context,
  area?: string,
) {
  const arena = await getArena(area);
  const enemies: string[] = [];

  await nav.execute(arena.path);

  when(MOB_PRESENT, ({ captured, fullMatch }) =>
    enemySpotted(fullMatch || captured[0]),
  );

  when(MOB_ARRIVES, ({ groups }) => enemySpotted(groups.mob));
  when(MOB_LEAVES, x => enemyGone(x.groups.mob));

  return nav.execute(arena.arena, async () => {
    await prompt.until(({ mv: { current: mv } }) => mv > 50);

    if ((await checkEnemies()) === false) {
      return false;
    }

    await prompt.until(
      ({ hp: { percent: hp }, mana: { percent: mana } }) =>
        hp > 0.6 && mana > 0.3,
    );
  });

  function enemySpotted(text: string) {
    const mob = getMobIn(text);

    if (mob) {
      enemies.push(mob);
    }
  }

  function enemyGone(text: string) {
    const mob = getMobIn(text);

    if (mob) {
      const index = enemies.indexOf(mob);
      if (index > -1) {
        enemies.splice(index, 1);
      }
    }
  }

  async function checkEnemies() {
    while (enemies.length) {
      const result = await invokeWorkflow('kill', [enemies.pop()!]);

      if (result === 'flee') {
        console.log('Had to run. Train over.');
        await nav.recall();
        return false;
      }
    }

    return true;
  }

  async function getArena(areaName?: string) {
    const area = areaName ? getAreaMetadata(areaName) : await getBestArea();

    if (!area) {
      throw new Error(`NO AREA "${areaName}"`);
    }

    const path = area.path!.split('');
    const last = path.pop();

    return { path: path.join(''), arena: `${last}${area.arena}` };
  }

  async function getBestArea() {
    const level = await stats.getLevel();
    const areas = getAreasForLevel(level);
    const [first, ...others] = areas.filter(x => x.arena);

    if (others.length) {
      console.warn('Multiple arenas available');
    }

    return first;
  }
}
