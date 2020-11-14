import { SPELLS_BY_TYPE } from '../data/spells';
import { concatRegexes } from '../lib/util/concatRegexes';
import { Context } from '../lib/workflow/Context';
import { CastSpellResult } from '../plugins/skillsPlugin';

export async function kill(
  { when, write, plugins: { navigation, skills } }: Context,
  target: string,
) {
  const attackSpells = [...SPELLS_BY_TYPE.dedope, ...SPELLS_BY_TYPE.attack];

  const cast = async () => skills.castSpell(attackSpells, target);
  const casted = (x: CastSpellResult) =>
    x === skills.CASTED || x === skills.ALREADY_APPLIED;
  const cantCast = (x: CastSpellResult) => x === skills.NOT_AVAILABLE;

  if (!(await tryNTimes(3, cast, casted, cantCast))) {
    write(`matar ${target}`);
  }

  const result = await Promise.any([
    navigation.waitForRecall().then(() => 'flee'),

    when(concatRegexes(target, /(?:\w|�| )* ha MUERTO!!/)).then(() => 'win'),

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

  async function tryNTimes<T>(
    times: number,
    action: () => Promise<T>,
    success: (x: T) => boolean,
    abort: (x: T) => boolean,
  ) {
    for (let i = 0; i < times; i++) {
      const result = await action();
      if (success(result)) return true;
      if (abort(result)) return false;
    }

    return false;
  }
}
