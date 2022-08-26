import { SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib';

export async function recover({
  run,
  sleep,
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

  const isInjured = () => hp() < wantedHp();
  const needsMana = () => mana() < 0.8;
  const needsRest = () => mv() < 1;

  const hasEnoughMana = () => (canMeditate ? mana() > 0.3 : mana() > 0.1);
  const isRefreshed = () => !isInjured() && !needsMana() && !needsRest();
  const isDoneCasting = () =>
    (canHeal ? !isInjured() : true) &&
    (canMeditate ? !needsMana() : true) &&
    (canRefresh ? !needsRest() : true);

  while (!isDoneCasting()) {
    let acted = false;

    if (canInvisible && !prompt.isInvisible) {
      acted = true;
      await run('cast', invisible);
    }

    if (canHeal && isInjured() && hasEnoughMana()) {
      acted = true;
      await run('cast', heal);
    }

    if (canRefresh && needsRest() && hasEnoughMana()) {
      acted = true;
      await run('cast', refresh);
    }

    if (canMeditate && needsMana()) {
      acted = true;
      const result = await skills.meditate();

      if (result === skills.BUSY) {
        await sleep(2);
      }
    }

    if (!acted) {
      break;
    }
  }

  await prompt.until(() => {
    const ready = isRefreshed();

    if (!ready) {
      console.log('Resting...');
    }

    return ready;
  });
}
