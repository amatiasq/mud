import { Casteable } from './../data/spells';
import { ATTACK_RECEIVED, getMobIn } from '../data/mobs';
import { SPELLS_BY_TYPE } from '../data/spells';
import { concatRegexes } from '../lib/util/concatRegexes';
import { Context } from '../lib/workflow/Context';
import { wait } from '../lib/util/wait';

export async function kill(
  { when, write, plugins: { navigation, skills } }: Context,
  target: string,
) {
  const { dedope } = SPELLS_BY_TYPE;
  const focused = target.startsWith('!');

  if (focused) {
    target = target.substr(1);
  }

  if (!(await repeatUntilCasted(dedope, target))) {
    write(`matar ${target}`);
  }

  when(ATTACK_RECEIVED, async ({ groups }) => {
    const fullName = groups.mob;
    const mob = getMobIn(fullName);
    const name = mob ? mob.name : fullName || target;
    const attack = focused
      ? SPELLS_BY_TYPE.attack
      : ([...SPELLS_BY_TYPE.massAttack, ...SPELLS_BY_TYPE.attack] as Casteable);

    await skills.castSpell(attack, name);
  });

  let bodyContent: string[] = [];

  const result = await Promise.any([
    navigation.waitForRecall().then(() => 'flee'),

    when(
      concatRegexes(target, /(?:\w|�| )* (ha)|(cae al suelo) MUERTO!!/i),
    ).then(() => 'win'),

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
    // no need to await for this
    handleBody(bodyContent);
  }

  return result;

  async function handleBody(items: string[]) {
    write('sacrificar cuerpo');
    await when('te da una moneda de oro por tu sacrificio.');
  }

  async function repeatUntilCasted(
    spell: Casteable,
    target: string,
  ): Promise<boolean> {
    switch (await skills.castSpell(spell, target)) {
      case skills.CASTED:
      case skills.ALREADY_APPLIED:
        return true;
      case skills.NOT_AVAILABLE:
        return false;
      case skills.BUSY:
        await wait(3);
      case skills.FAILED:
        return repeatUntilCasted(spell, target);
    }

    throw new Error('WTF DUDE');
  }
}
