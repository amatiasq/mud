import { SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib';

export async function recover({
  run,
  sleep,
  when,
  write,
  plugins: { skills, prompt },
}: Context) {
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

  const wantedHp = () => (canMeditate ? 1 : Math.max(mana(), 0.5));

  const needsHeal = () => hp() < wantedHp();
  const needsToMeditate = () => mana() < 0.8;
  const needsRefresh = () => mv() < 1;

  const hasEnoughMana = () => (canMeditate ? mana() > 0.3 : mana() > 0.1);
  const isDone = () =>
    (canHeal ? !needsHeal() : true) &&
    (canMeditate ? !needsToMeditate() : true) &&
    (canRefresh ? !needsRefresh() : true);

  while (!isDone()) {
    let acted = false;

    if (canInvisible && !prompt.isInvisible) {
      acted = true;
      await run('cast', [invisible]);
    }

    if (canHeal && needsHeal() && hasEnoughMana()) {
      acted = true;
      await run('cast', [heal]);
    }

    if (canRefresh && needsRefresh() && hasEnoughMana()) {
      acted = true;
      await run('cast', [refresh]);
    }

    if (canMeditate && needsToMeditate()) {
      acted = true;
      const result = await skills.meditate();

      if (result === skills.BUSY) {
        await sleep(2);
      }
    }

    if (!acted) {
      write('dormir');
      await when([
        'Cierras los ojos y caes en un profundo suenyo.',
        'Ya estas durmiendo.',
      ]);

      await Promise.any([
        sleep(30).then(() => write('despertar')),
        when('Te despiertas y te pones de pie.'),
      ]);
    }
  }
}
