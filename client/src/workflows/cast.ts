import { wait } from '../lib/util/wait';
import { Context } from '../lib/workflow/Context';

export async function cast(
  { plugins: { prompt, skills } }: Context,
  name: string | string[],
) {
  const result = await repeatUntilCasted(name);

  if (result === false) {
    throw new Error(`Unable to cast "${name}"`);
  }

  return result;

  async function repeatUntilCasted(
    spell: string | string[],
    args = '',
  ): Promise<boolean> {
    if (prompt.isFighting) {
      await prompt.until(x => !x.isFighting);
    }

    switch (await skills.castSpell(spell, args)) {
      case skills.CASTED:
      case skills.ALREADY_APPLIED:
        return true;
      case skills.NOT_AVAILABLE:
        return false;
      case skills.BUSY:
        await wait(3);
      case skills.FAILED:
        return repeatUntilCasted(spell, args);
    }

    throw new Error('WTF DUDE');
  }
}
