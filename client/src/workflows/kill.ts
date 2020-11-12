import { SPELLS_BY_TYPE } from '../data/spells';
import { concatRegexes } from '../lib/util/concatRegexes';
import { Context } from '../lib/workflow/Context';
import { CastSpellResult } from '../plugins/skillsPlugin';

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
    when(concatRegexes(target, /(?:\w| )* ha MUERTO!!/)).then(() => 'win'),
    when('No esta aqui.')
      .timeout(3)
      .then(() => 'missing'),
    when([
      'Huyes como un cobarde del combate.',
      'Estas demasiado malherido para hacer eso.',
      'Estas demasiado aturdido para hacer eso.',
    ]).then(() => 'flee'),
  ]);

  if (result === 'win') {
    write('sacrificar cuerpo');
    await when('te da una moneda de oro por tu sacrificio.');
  }

  return result;

  async function tryNTimes(
    times: number,
    action: () => Promise<CastSpellResult>,
  ) {
    for (let i = 0; i < times; i++) {
      if (await action()) {
        return true;
      }
    }

    return false;
  }
}
