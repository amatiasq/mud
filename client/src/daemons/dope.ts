import { ClientStorage } from '@amatiasq/client-storage';

import {
  Casteable,
  getSpells,
  Spell,
  SpellName,
  SPELLS_BY_TYPE,
} from '../data/spells';
import { Context } from '../lib';
import { uniq } from '../util/uniq';

const memory = new ClientStorage<(string | string[])[]>('dope:casting');
const spellGroups = Object.values(SPELLS_BY_TYPE) as SpellName[][];

export async function dope({
  when,
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

  spells.filter(x => x.end).forEach(watchDope);

  prompt.onUpdate(
    async ({
      isFighting,
      mana: { percent: mana },
      hp: { percent: hp },
      mv: { percent: mv },
    }) => {
      if (isFighting) {
        return;
      }

      const canMeditate = await skills.can('meditar');

      if (mana < 0.1 && !canMeditate) {
        return;
      }

      if (mana < 0.7 && canMeditate) {
        return skills.meditate();
      }

      if (hp > 0 && shouldHeal(mana, hp)) {
        return skills.castSpell(SPELLS_BY_TYPE.heal);
      }

      if (hp > 0 && shouldRefresh(mana, mv)) {
        return skills.castSpell('refrescar');
      }
    },
  );

  when('No puedes mantener un pensamiento fijo.', async () => {
    if (await skills.can('curar veneno')) {
      // cast curar veneno
    }
  });

  register('dope', async ({ run }: Context, target?: string) => {
    const list = spells
      .filter(spell => spell.effect && (target ? spell.target : true))
      .map(spell => getSpellGroup(spell.name));

    const clean = uniq(list.map(x => x.join('|'))).map(
      x => x.split('|') as Casteable,
    );

    for (const spell of clean) {
      if (await skills.can(spell)) {
        await run('cast', [spell, target]);
      }
    }
  });

  async function watchDope(spell: Spell) {
    const invoke = getSpellGroup(spell.name);

    when(spell.end!, async () => {
      casting.add(invoke);
      memory.set([...casting]);

      const success = await repeatUntilCasted(invoke);

      if (success) {
        casting.delete(invoke);
        memory.set([...casting]);
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

  function getSpellGroup(name: SpellName) {
    const group = spellGroups.find(x => x.includes(name));
    return group ? group : [name];
  }
}
