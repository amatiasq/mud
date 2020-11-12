import { ITEM_SUSTANTIVES } from '../data/items';
import { Context } from './../lib/workflow/Context';

const rooms = [
  { from: 31, to: 40, path: '4wn' },
  { from: 21, to: 30, path: '3wn' },
  { from: 11, to: 20, path: '2wn' },
  { from: 1, to: 10, path: 'wn' },
  { from: 41, to: 50, path: 'en' },
  { from: 51, to: 60, path: '2en' },
  { from: 61, to: 70, path: '3en' },
  { from: 71, to: 80, path: '4en' },
];

export async function donations({
  when,
  write,
  run,
  plugins: { navigation: nav, stats },
}: Context) {
  write('estado');
  const level = await stats.getLevel();
  const room = rooms.find(x => x.from <= level && x.to <= level);

  if (!room) {
    throw new Error(`No room for level "${level}"`);
  }

  await nav.execute('rh2w4n');

  const promise = when(/Salidas: sur\.\n\n((?:.|\n)*)\n\n/, {
    // donations rooms can get HUGE
    captureLength: Number.MAX_VALUE,
  });

  await nav.execute(room.path);

  const { captured: itemsMatch } = await promise;
  const list = itemsMatch[1].split('\n').map(x => x.trim());

  for (const item of Object.values(ITEM_SUSTANTIVES)) {
    const found = list.some(x => x.includes(item) && !x.includes('mallas'));

    if (found) {
      await run('wear', [item]);
    }
  }

  await nav.recall();
}
