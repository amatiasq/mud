import { getAreaMetadata, getAreasForLevel } from '../data/areas';
import {
  getMobFromPresence,
  getMobIn,
  getMobsPresence,
  Mob,
  MOB_ARRIVES,
  MOB_DIES,
  MOB_LEAVES,
} from '../data/mobs';
import { Context } from '../lib';
import { SinglePattern } from './../lib/triggers/Pattern';
import { KillResult } from './kill';

const AVOID: SinglePattern[] = [
  'Un hombre desnudo yace sobre sus propios excrementos.',
  'Una figura humanoide resplandece detras de un brillante campo de fuerza.',
];

export async function train(
  {
    log,
    run,
    when,
    write,
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
  const theif = getMobIn('ladron');
  const enemies: Mob[] = [];
  let avoidRoom = false;

  when(getMobsPresence(), ({ patterns, fullMatch, captured }) => {
    if (patterns.some(x => AVOID.includes(x))) {
      avoidRoom = true;
      return;
    }

    return enemySpotted(
      getMobFromPresence(patterns) || getMobIn(fullMatch || captured[0]),
    );
  });

  when(MOB_ARRIVES, ({ groups }) => enemySpotted(getMobIn(groups.mob)));
  when(
    MOB_LEAVES,
    ({ groups }) => groups.mob && enemyGone(getMobIn(groups.mob)),
  );
  when(MOB_DIES, ({ groups }) => groups.mob && enemyGone(getMobIn(groups.mob)));

  const route = `${arena.path}${arena.arena}`;

  write('visible');
  write('huida');

  await nav.execute(route, enterRoom);
  return nav.recall();

  async function enterRoom() {
    if (avoidRoom) {
      avoidRoom = false;
      return true;
    }

    log('ENTER_ROOM');
    await prompt.until(({ mv: { current: mv } }) => mv > 50);

    while (enemies.length) {
      if (await checkEnemies()) {
        return false;
      }

      const recover = run('recover');
      await Promise.any([
        recover,
        when(MOB_ARRIVES).then(() => recover.cancel()),
      ]);

      log('READY_TO_FIGHT!!!');
    }
  }

  function enemySpotted(mob: Mob | null = null) {
    if (mob && (mob !== theif || !enemies.includes(theif))) {
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
      const enemy = enemies[0];
      const result = (await run('kill', [enemy.name])) as KillResult;

      if (result === 'flee') {
        console.log('Had to run. Train over.');
        await nav.recall();
        return true;
      }

      if (result === 'missing') {
        enemies.shift();
      }
    }
  }

  async function getArena(areaName?: string) {
    const area = areaName ? getAreaMetadata(areaName) : await getBestArea();

    if (!area) {
      throw new Error(`NO AREA "${areaName}"`);
    }

    if (!area.arena) {
      throw new Error(`"${area.name}" training path is unknown`);
    }

    const path = area.path!.split('');
    const last = path.pop();
    const arena = Array.isArray(area.arena) ? area.arena.join('') : area.arena;

    return { path: path.join(''), arena: `${last}${arena}` };
  }

  async function getBestArea() {
    const [realm, level] = await Promise.all([
      nav.getRealm(),
      stats.getLevel(),
    ]);

    const areas = getAreasForLevel(realm, level);
    const [first, ...others] = areas.filter(x => x.arena);

    if (others.length) {
      console.warn('Multiple arenas available');
    }

    console.log('Selected', first.name);
    return first;
  }
}
