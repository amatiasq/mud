import { wait } from '../lib/util/wait';
import { Context } from '../lib/workflow/Context';

export async function cast(
  { plugins: { prompt, skills } }: Context,
  spell: string | string[],
  ...args: string[]
) {
  const result = await repeatUntilCasted();

  if (result === false) {
    throw new Error(`Unable to cast "${spell}"`);
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
