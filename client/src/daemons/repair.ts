import { getItemSustantive, ItemName, UNWEAR } from '../data/items';
import { wait } from '../lib/util/wait';
import { Context } from '../lib/workflow/Context';

export async function repair({
  when,
  write,
  register,
  plugins: { navigation, prompt },
}: Context) {
  register('repair', async () => {
    const broken = await getBrokenEquipment();

    if (broken) {
      await navigation.execute('r2ses');
      return repairEquipment(broken);
    }
  });

  when('No puedes vestir eso, necesita repararse.', async () => {
    await navigation.execute('r2ses');
    await repairAll();

    const broken = await getBrokenEquipment();

    if (broken) {
      return repairEquipment(broken);
    }
  });

  async function repairEquipment(broken: ItemName[]) {
    for (const item of broken) {
      write(`guardar ${item}`);
      await when(UNWEAR);
    }

    await repairAll();
    return navigation.execute('nw2n');
  }

  async function getBrokenEquipment() {
    const broken: ItemName[] = [];
    write('equipo');

    const sus = when(/>\s+\[\+*[^+]+\] (?<item>.*)/, ({ groups }) => {
      const item = getItemSustantive(groups.item);
      if (item) broken.push(item);
    });

    await when('Estas usando:');
    await prompt.until();
    sus.unsubscribe();

    return broken.length ? broken : null;
  }

  async function repairAll() {
    write('reparar todo');

    await Promise.any([
      when('El herrero te cobra').then(() => true),
      when('El herrero te cuenta').then(() => false),
      wait(5).then(() => null),
    ]);

    write('vestir todo');
  }
}
