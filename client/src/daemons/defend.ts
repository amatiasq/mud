import { getMobIn } from '../data/mobs';
import { SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib/workflow/Context';

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
      const name = getMobIn(fullName);
      await skills.castSpell(SPELLS_BY_TYPE.attack, name || fullName);
    } else {
      log('Nothing');
    }
  });

  when('.. Todo empieza a volverse negro.\n', async () => {
    const RECUPERED =
      'Tu cuerpo aparece de repente, rodeado por una divina presencia...';

    let bodies = 0;

    const sus = when(RECUPERED, () => bodies++);

    await write('suplicar cuerpo');
    await when(RECUPERED).timeout(5);

    sus.unsubscribe();

    when('El cadaver de May pasa a convertirse en polvo', () => bodies--);

    while (bodies) {
      write('coger todo may');
      await prompt.until();
      write('vestir todo');
      await prompt.until();
      await prompt.until();
    }
  });
}
