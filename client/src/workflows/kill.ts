import { Context } from '../lib/workflow/Context';

export async function kill(
  { when, write, plugins: { prompt, navigation, skills } }: Context,
  target: string,
) {
  when('Estas demasiado exhausto para huir del combate!', () =>
    navigation.recall(),
  );

  when(
    [
      new RegExp(`Tu (?<attack>\\w+) (?<effect>\\w+) a( |\\w)+ ${target}.`),
      new RegExp(`El ataque de( |\\w)+ ${target} te (?<effect>\w+).`),
    ],
    update,
  );

  const attackSpells = [
    'ceguera',
    'causar fatales',
    'causar critica',
    'causar graves',
    'causar leves',
  ];

  const cast = () => skills.castSpell(attackSpells, target);

  if (!(await tryNTimes(3, cast))) {
    write(`matar ${target}`);
  }

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

  async function update() {
    if (prompt.isInDanger) {
      await navigation.recall();
    } else if (prompt.isExhausted || prompt.needsHospital) {
      write('huir');
    } else {
      await skills.castSpell(['causar graves', 'causar leves']);
    }
  }

  async function tryNTimes(times: number, action: () => Promise<boolean>) {
    for (let i = 0; i < times; i++) {
      if (await action()) {
        return true;
      }
    }

    return false;
  }
}
