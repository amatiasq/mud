import { getAreaMetadata, getAreasForLevel } from '../data/areas';
import { getMobIn, MOB_ARRIVES, MOB_LEAVES, MOB_PRESENT } from '../data/mobs';
import { Context } from '../lib/workflow/Context';

export async function train(
  {
    log,
    run,
    when,
    write,
    printLogs,
    plugins: { navigation: nav, prompt, stats },
  }: Context,
  area?: string,
) {
  const arena = await getArena(area);
  const enemies: string[] = [];

  when(MOB_PRESENT, ({ captured, fullMatch }) =>
    enemySpotted(fullMatch || captured[0]),
  );

  when(MOB_ARRIVES, ({ groups }) => enemySpotted(groups.mob));
  when(MOB_LEAVES, x => {
    const { mob } = x.groups;
    if (mob) {
      enemyGone(x.groups.mob);
    } else {
      console.warn(`No MOB detected in`, x.captured);
    }
  });

  const route = `${arena.path}${arena.arena}`;

  write('visible');

  await nav.execute(route, enterRoom);
  return nav.recall();

  async function enterRoom() {
    await prompt.until(({ mv: { current: mv } }) => mv > 50);

    while (enemies.length) {
      if (await checkEnemies()) {
        return false;
      }

      await Promise.any([when(MOB_ARRIVES), readyToFight()]);
    }
  }

  async function readyToFight() {
    return prompt.until(
      ({ hp: { percent: hp }, mana: { percent: mana } }) =>
        hp > 0.7 && mana > 0.5,
    );
  }

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
      const result = await run('kill', [enemies.pop()!]);

      if (result === 'flee') {
        console.log('Had to run. Train over.');
        await nav.recall();
        return true;
      }

      log(`Fight result: ${result}`);
    }
  }

  async function getArena(areaName?: string) {
    const area = areaName ? getAreaMetadata(areaName) : await getBestArea();

    if (!area) {
      throw new Error(`NO AREA "${areaName}"`);
    }

    if (!area.arena) {
      throw new Error(`"${area.name}" is unknown`);
    }

    const path = area.path!.split('');
    const last = path.pop();
    const arena = Array.isArray(area.arena) ? area.arena.join('') : area.arena;

    return { path: path.join(''), arena: `${last}${arena}` };
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
