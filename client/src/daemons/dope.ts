import { ClientStorage } from '@amatiasq/client-storage';

import { getSpells, SpellDescription, SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib/workflow/Context';
import { uniq } from '../util/uniq';

const memory = new ClientStorage<(string | string[])[]>('dope:casting');

export async function dope({
  when,
  write,
  register,
  run,
  plugins: { prompt, skills },
}: Context) {
  const shouldHeal = defineShould(0.2);
  const shouldRefresh = defineShould(0.1, 0.8);
  const repeatUntilCasted = (
    name: string | string[],
    ...args: (string | undefined)[]
  ) => run('cast', [name, ...args]).catch(() => null);

  const casting = new Set(memory.get());
  const spells = getSpells();

  spells.filter(x => x.endEffect).forEach(watchDope);

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

      if (hp > 0 && shouldHeal(mana, hp)) {
        return skills.castSpell(SPELLS_BY_TYPE.heal);
      }

      if (hp > 0 && shouldRefresh(mana, mv)) {
        return skills.castSpell('refrescar');
      }
    },
  );

  register('dope', async (x: Context, name?: string) => {
    const list = spells
      .filter(x => x.dope && (name ? x.target : true))
      .map(x => (Array.isArray(x.dope) ? x.dope.join('|') : x.name));

    for (const spell of uniq(list)) {
      await repeatUntilCasted(spell.split('|'), name);
    }
  });

  async function watchDope(spell: SpellDescription) {
    const invoke = Array.isArray(spell.dope) ? spell.dope : spell.name;

    when(spell.endEffect!, async () => {
      casting.add(invoke);
      memory.set([...casting]);

      const success = await repeatUntilCasted(invoke);

      if (success) {
        casting.delete(invoke);
        memory.set([...casting]);

        const after = spell.afterDope;

        if (Array.isArray(after)) {
          after.forEach(x => write(x));
        } else if (after) {
          write(after as string);
        }
      }
    });
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
