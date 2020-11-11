import { SPELLS_BY_TYPE } from './../spells';
import { Context } from '../lib/workflow/Context';

export async function kill(
  { when, write, plugins: { navigation, skills } }: Context,
  target: string,
) {
  const attackSpells = [...SPELLS_BY_TYPE.dedope, ...SPELLS_BY_TYPE.attack];
  const cast = () => skills.castSpell(attackSpells, target);

  if (!(await tryNTimes(3, cast))) {
    write(`matar ${target}`);
  }

  // wile result == null cast attack!!!!
  const result = await Promise.any([
    navigation.waitForRecall().then(() => 'flee'),
    when(`${target} ha MUERTO!!`).then(() => 'win'),
    when('Huyes como un cobarde del combate.').then(() => 'flee'),
    when('No esta aqui.')
      .timeout(3)
      .then(() => 'missing'),
  ]);

  if (result === 'win') {
    write('sacrificar cuerpo');
    await when('te da una moneda de oro por tu sacrificio.');
  }

  return result;

  async function tryNTimes(times: number, action: () => Promise<boolean>) {
    for (let i = 0; i < times; i++) {
      if (await action()) {
        return true;
      }
    }

    return false;
  }
}
