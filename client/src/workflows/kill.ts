import { Casteable, SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib';
import { concatRegexes } from '../lib/util/concatRegexes';

export type KillResult = 'win' | 'flee' | 'missing';

export async function kill(
  { sleep, when, write, plugins: { prompt, navigation, skills } }: Context,
  target: string,
): Promise<KillResult> {
  const { dedope } = SPELLS_BY_TYPE;
  const focused = target.startsWith('!');

  if (focused) {
    target = target.substr(1);
  }

  if (!(await repeatUntilCasted(dedope, target))) {
    write(`matar ${target}`);
  }

  const unsubscribe = prompt.onUpdate(x => {
    if (x.hp.percent <= 0.4) {
      navigation.recall();
    }
  });

  // when(ATTACK_RECEIVED, async ({ groups }) => {
  //   if (prompt.getPercent('mana') < 0.2) {
  //     return;
  //   }

  //   const fullName = groups.mob;
  //   const mob = getMobIn(fullName);
  //   const name = mob ? mob.name : fullName || target;
  //   const attack = focused
  //     ? SPELLS_BY_TYPE.attack
  //     : ([...SPELLS_BY_TYPE.massAttack, ...SPELLS_BY_TYPE.attack] as Casteable);

  //   await skills.castSpell(attack, name);
  // });

  let bodyContent: string[] = [];

  const result = await Promise.any([
    navigation.waitForRecall().then(() => 'flee' as KillResult),

    when([
      concatRegexes(target, /(?:\w|�| )* (ha)|(cae al suelo) MUERTO!!/i),
      'monedas de oro de el cadaver de un ladron',
    ]).then(() => 'win' as KillResult),

    when('No esta aqui.')
      .timeout(3)
      .then(() => 'missing' as KillResult),

    when([
      'Huyes como un cobarde del combate.',
      'Estas demasiado malherido para hacer eso.',
      'Estas demasiado aturdido para hacer eso.',
    ]).then(() => 'flee' as KillResult),
  ]);

  if (result === 'win') {
    // no need to await for this
    setTimeout(() => handleBody(bodyContent));
  }

  unsubscribe();
  return result;

  async function handleBody(items: string[]) {
    write('sacrificar cuerpo');
    // await when('te da una moneda de oro por tu sacrificio.');
  }

  async function repeatUntilCasted(
    spell: Casteable,
    target: string,
  ): Promise<boolean> {
    if (prompt.getPercent('mana') < 0.1) {
      return false;
    }

    switch (await skills.castSpell(spell, target)) {
      case skills.CASTED:
      case skills.ALREADY_APPLIED:
        return true;
      case skills.NOT_AVAILABLE:
        return false;
      case skills.BUSY:
        await sleep(3);
      case skills.FAILED:
        return repeatUntilCasted(spell, target);
    }

    throw new Error('WTF DUDE');
  }
}
