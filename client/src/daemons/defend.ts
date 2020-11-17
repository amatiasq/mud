import { ATTACK_RECEIVED, getMobIn } from '../data/mobs';
import { SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib/workflow/Context';

export async function defend({
  isRunning,
  when,
  write,
  plugins: { prompt, skills, navigation },
}: Context) {
  when('Estas demasiado exhausto para huir del combate!', () =>
    navigation.recall(),
  );

  when(ATTACK_RECEIVED, async ({ groups }) => {
    console.log('Attack received', isRunning('kill'));

    if (isRunning('kill')) {
      return;
    }

    const mana = prompt.getPercent('mana');
    const fullName = groups.mob;

    if (fullName && mana > 0.1) {
      const mob = getMobIn(fullName);
      await skills.castSpell(SPELLS_BY_TYPE.attack, mob ? mob.name : fullName);
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

  when(/El cadaver de.* contiene:(?<items>(?:.|\n)+)\n[^ ]/, ({ groups }) => {
    const items = groups.items
      .toLowerCase()
      .split(/\n/)
      .map(x => x.trim())
      .filter(x => x && x !== 'nada.');

    if (items.some(x => x.includes('llave'))) {
      write('coger llave cuerpo');
    }
  });
}
