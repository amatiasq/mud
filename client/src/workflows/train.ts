import { Mob } from './../data/mobs';
import { getAreaMetadata, getAreasForLevel } from '../data/areas';
import {
  getMobIn,
  MOB_ARRIVES,
  MOB_LEAVES,
  getMobsPresence,
  getMobFromPresence,
} from '../data/mobs';
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
  if (area === 'test') {
    const area = await getBestArea();
    console.log(area.name, area);
    return;
  }

  const arena = await getArena(area);
  const enemies: Mob[] = [];

  when(getMobsPresence(), ({ patterns, fullMatch, captured }) =>
    enemySpotted(
      getMobFromPresence(patterns) || getMobIn(fullMatch || captured[0]),
    ),
  );

  when(MOB_ARRIVES, ({ groups }) => enemySpotted(getMobIn(groups.mob)));
  when(MOB_LEAVES, x => {
    const { mob } = x.groups;
    if (mob) {
      enemyGone(getMobIn(x.groups.mob));
    } else {
      console.warn(`No MOB detected in`, x.captured);
    }
  });

  const route = `${arena.path}${arena.arena}`;

  write('visible');

  await nav.execute(route, enterRoom);
  return nav.recall();

  async function enterRoom() {
    log('ENTER_ROOM');
    await prompt.until(({ mv: { current: mv } }) => mv > 50);
    log('READY');

    while (enemies.length) {
      if (await checkEnemies()) {
        return false;
      }

      log('WAITING_READY_TO_FIGHT');

      const recover = run('recover');
      await Promise.any([
        recover,
        when(MOB_ARRIVES).then(() => recover.abort()),
      ]);

      log('READY_TO_FIGHT!!!');
    }

    log('LEAVE_ROOM');
  }

  function enemySpotted(mob: Mob | null = null) {
    if (mob) {
      enemies.push(mob);
    }
  }

  function enemyGone(mob: Mob | null = null) {
    if (mob) {
      const index = enemies.indexOf(mob);
      if (index > -1) {
        enemies.splice(index, 1);
      }
    }
  }

  async function checkEnemies() {
    log('CHECK_ENEMIES', enemies.length);

    while (enemies.length) {
      const result = await run('kill', [enemies.pop()!.name]);

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
