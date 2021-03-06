import { Casteable } from '../data/spells';
import { Context } from '../lib';
import { wait } from '../lib/util/wait';

export async function cast(
  { plugins: { prompt, skills } }: Context,
  spell: Casteable,
  ...args: string[]
) {
  const result = await repeatUntilCasted();

  if (result === false) {
    console.warn(`Unable to cast "${spell}"`);
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
        await wait(3);
      case skills.FAILED:
        return repeatUntilCasted();
    }

    throw new Error('WTF DUDE');
  }
}
