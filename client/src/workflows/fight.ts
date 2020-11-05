import { Context } from '../lib/workflow/Context';

export async function fight(
  { watch, write, waitFor, plugins: { prompt, navigation } }: Context,
  target: string,
) {
  let isTargetDead = false;

  watch('Estas demasiado exhausto para huir del combate!', () =>
    navigation.recall(),
  );

  watch(
    [
      new RegExp(`Tu (?<attack>\\w+) (?<effect>\\w+) a( |\\w)+ ${target}.`),
      new RegExp(`El ataque de( |\\w)+ ${target} te (?<effect>\w+).`),
    ],
    update,
  );

  write(`kill ${target}`);

  await Promise.any([
    waitFor(`${target} ha MUERTO!!`).then(() => (isTargetDead = true)),
    waitFor('Huyes como un cobarde del combate.'),
    waitFor('No esta aqui.').timeout(0.5),
    navigation.waitForRecall(),
  ]);

  return isTargetDead;

  async function update() {
    if (prompt.isInDanger) {
      await navigation.recall();
    } else if (prompt.isExhausted || prompt.needsHospital) {
      write('huir');
    }
  }
}
