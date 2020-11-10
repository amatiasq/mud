import { ClientStorage } from '@amatiasq/client-storage';
import { wait } from '../lib/util/wait';
import { getSpells } from '../spells';
import { Context } from './../lib/workflow/Context';

const memory = new ClientStorage<(string | string[])[]>('dope:casting');

export async function dope({
  when,
  runForever,
  plugins: { prompt, skills },
}: Context) {
  const shouldHeal = defineShould(0.2);
  const shouldRefresh = defineShould(0.1, 0.8);
  const casting = new Set(memory.get());
  const spells = getSpells().filter(x => x.dope);

  for (const { name: spell, endEffect, dope } of spells) {
    if (!endEffect) {
      console.warn(`Waiting for end effect for ${spell}`);
      continue;
    }

    const invoke = Array.isArray(dope) ? dope : spell;

    when(endEffect, async () => {
      casting.add(invoke);
      memory.set([...casting]);

      const success = await repeatUntilCasted(invoke);

      if (success) {
        casting.delete(invoke);
        memory.set([...casting]);
      }
    });

    repeatUntilCasted(invoke);
  }

  prompt.onUpdate(
    async ({
      isFighting,
      mana: { percent: mana },
      hp: { percent: hp },
      mv: { percent: mv },
    }) => {
      if (isFighting || mana === 0) {
        return;
      }

      if (shouldHeal(mana, hp)) {
        return skills.castSpell('curar leves');
      }

      if (shouldRefresh(mana, mv)) {
        return skills.castSpell('refrescar');
      }
    },
  );

  await runForever();

  async function repeatUntilCasted(
    spell: string | string[],
    args = '',
  ): Promise<boolean> {
    if (prompt.isFighting) {
      await prompt.until(x => !x.isFighting);
    }

    switch (await skills.castSpell(spell, args)) {
      case skills.CASTED:
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

  function defineShould(min: number, max = 1) {
    const multiplier = 1 / (max - min);

    return (mana: number, stat: number) => {
      if (mana === 0 || stat > max) return false;
      if (stat < min) return true;

      const clapped = (stat - min) * multiplier;
      return Math.hypot(mana, 1 - clapped) > 1;
    };
  }
}
