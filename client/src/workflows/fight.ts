import { Context } from '../lib/workflow/Context';

export async function fight(
  { when, write, plugins: { prompt, navigation } }: Context,
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

  // if causar graves
  // if causar leves
  write(`kill ${target}`);

  return Promise.any([
    navigation.waitForRecall().then(() => 'flee'),
    when(`${target} ha MUERTO!!`).then(() => 'win'),
    when('Huyes como un cobarde del combate.').then(() => 'flee'),
    when('No esta aqui.')
      .timeout(3)
      .then(() => 'missing'),
  ]);

  async function update() {
    if (prompt.isInDanger) {
      await navigation.recall();
    } else if (prompt.isExhausted || prompt.needsHospital) {
      write('huir');
    }
  }
}
