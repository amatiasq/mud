import { SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib';
import { wait } from '../lib/util/wait';

export async function recover({ run, plugins: { skills, prompt } }: Context) {
  const heal = SPELLS_BY_TYPE.heal;
  const refresh = 'refrescar';
  const invisible = 'invisibilidad';

  const canHeal = await skills.can(heal);
  const canRefresh = await skills.can(refresh);
  const canMeditate = await skills.can('meditar');
  const canInvisible = await skills.can(invisible);

  const hp = () => prompt.getPercent('hp');
  const mana = () => prompt.getPercent('mana');
  const mv = () => prompt.getPercent('mv');

  const needsHeal = () => hp() < 1;
  const needsToMeditate = () => mana() < 0.8;
  const needsRefresh = () => mv() < 1;

  const hasEnoughMana = () => (canMeditate ? mana() > 0.5 : mana() > 0.1);
  const isDone = () =>
    (canHeal ? !needsHeal() : true) &&
    (canMeditate ? !needsToMeditate() : true) &&
    (canRefresh ? !needsRefresh() : true);

  while (!isDone()) {
    if (canInvisible && !prompt.isInvisible) {
      await run('cast', [invisible]);
    }

    while (canHeal && needsHeal() && hasEnoughMana()) {
      await run('cast', [heal]);
    }

    while (canRefresh && needsRefresh() && hasEnoughMana()) {
      await run('cast', [refresh]);
    }

    while (canMeditate && needsToMeditate()) {
      const result = await skills.meditate();

      if (result === skills.BUSY) {
        await wait(2);
      }
    }
  }
}
