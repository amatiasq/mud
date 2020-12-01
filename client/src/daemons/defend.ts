import { ATTACK_RECEIVED, getMobIn } from '../data/mobs';
import { Casteable, SPELLS_BY_TYPE } from '../data/spells';
import { Context } from '../lib';

export async function defend({
  isRunning,
  run,
  when,
  write,
  plugins: { prompt, skills, navigation },
}: Context) {
  when('Estas demasiado exhausto para huir del combate!', () =>
    navigation.recall(),
  );

  when(ATTACK_RECEIVED, async ({ groups }) => {
    if (isRunning('kill')) {
      return;
    }

    const mana = prompt.getPercent('mana');
    const fullName = groups.mob;

    if (!fullName || mana <= 0.1) {
      return;
    }

    const mob = getMobIn(fullName);
    const hp = prompt.getPercent('hp');
    const attack =
      hp < 0.5
        ? <Casteable>[...SPELLS_BY_TYPE.massAttack, ...SPELLS_BY_TYPE.attack]
        : SPELLS_BY_TYPE.attack;

    await skills.castSpell(attack, mob ? mob.name : fullName);
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

  when('Esta completamente oscuro ...', async () => {
    if (await skills.can('luz eterna')) {
      await run('cast', ['luz eterna']);
      write('vestir luz');
      write('mirar');
    }
  });

  when('Estas maldito y no puedes usar el regresar!', async () => {
    if (await skills.can('retirar maldicion')) {
      await run('cast', ['retirar maldicion']);
      await navigation.recall();
    }
  });

  when(/El cadaver de.* contiene:(?<items>(?:.|\n)+)\n[^ ]/, ({ groups }) => {
    const items = groups.items
      .toLowerCase()
      .split(/\n/)
      .map(x => x.trim())
      .filter(x => x && x !== 'nada.');

    // Use if looking for a specific item
    // if (items.some(x => x.includes('yelmo de orco'))) {
    //   write('coger yelmo cuerpo');
    // }

    if (items.some(x => x.includes('llave'))) {
      write('coger llave cuerpo');
    }
  });

  when('Tragas agua al intentar respirar!', async () => {
    if (await skills.can('respiracion acuatica')) {
      skills.castSpell('respiracion acuatica');
    }
  });
}
