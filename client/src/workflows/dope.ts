import { ClientStorage } from '@amatiasq/client-storage';
import { wait } from '../lib/util/wait';
import { Context } from './../lib/workflow/Context';

const memory = new ClientStorage<string[]>('dope:casting');

export async function dope({
  when,
  runForever,
  plugins: { prompt, skills },
}: Context) {
  const shouldHeal = defineShould(0.2);
  const shouldRefresh = defineShould(0.1, 0.5);
  const casting = new Set(memory.get());

  ensureAlways('detectar invisible', 'Ya no ves objetos invisibles.');
  ensureAlways('armadura', 'Tu armadura vuelve a su valor normal.');
  ensureAlways('detectar magia', 'Las lineas azules desaparecen de tu vision.');
  ensureAlways('flotar', 'Tus pies aterrizan suavemente en el suelo.');

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

  function ensureAlways(spell: string, trigger: string) {
    when(trigger, async () => {
      casting.add(spell);
      memory.set([...casting]);

      const success = await repeatUntilCasted(spell);

      if (success) {
        casting.delete(spell);
        memory.set([...casting]);
      }
    });
  }

  async function repeatUntilCasted(spell: string, args = ''): Promise<boolean> {
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
