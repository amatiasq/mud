import { SPELLS_BY_TYPE } from '../spells';
import { Context } from './../lib/workflow/Context';

const sustantives = [
  'serpiente',
  'caracol',
  'lobo',
  'conejo',
  'ogro',
  'orco',
  'buitre',
  'ciervo',
  'dragon',
];

export async function defend({
  log,
  when,
  write,
  plugins: { prompt, skills, navigation },
}: Context) {
  when('Estas demasiado exhausto para huir del combate!', () =>
    navigation.recall(),
  );

  when(/El \w+ de (?:el|la|un|una) ((?: |\w)+) te /, async ({ captured }) => {
    const hp = prompt.getPercent('hp');

    if (hp < 0.1) {
      await navigation.recall();
    } else if (prompt.getPercent('mv') < 0.1 || hp < 0.3) {
      write('huir');
    } else if (prompt.getPercent('mana') > 0.1) {
      const fullName = captured[1];
      const name = sustantives.find(x => fullName.includes(x));

      if (!name) {
        console.warn(`Unknown sustantive for "${fullName}"`);
      }

      await skills.castSpell(SPELLS_BY_TYPE.attack, name || fullName);
    } else {
      log('Nothing');
    }
  });
}
