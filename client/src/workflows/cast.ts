import { Casteable } from '../data/spells';
import { Context } from '../lib';

export async function cast(
  { sleep, when, write, plugins: { prompt, skills } }: Context,
  spell: Casteable,
  ...args: string[]
) {
  let wasSleeping = false;

  when('Tienes un bonito sueño donde eres el mejor mago del mundo.', () => {
    wasSleeping = true;
    write('despertar');
  });

  const result = await repeatUntilCasted();

  if (result === false) {
    console.warn(`Unable to cast "${spell}"`);
  }

  if (wasSleeping) {
    write('dormir');
    await when([
      'Cierras los ojos y caes en un profundo suenyo.',
      'Ya estas durmiendo.',
    ]);
  }

  return result;

  async function repeatUntilCasted(): Promise<boolean> {
    if (prompt.isFighting) {
      await prompt.until(x => !x.isFighting);
    }

    switch (await skills.castSpell(spell, args.join(' '))) {
      case skills.CASTED:
      case skills.ALREADY_APPLIED:
        return true;
      case skills.NOT_AVAILABLE:
        return false;
      case skills.BUSY:
        await sleep(3);
      case skills.FAILED:
        return repeatUntilCasted();
    }

    throw new Error('WTF DUDE');
  }
}
