import { Realm } from '../data/areas';
import { getItemSustantive, ItemName, UNWEAR } from '../data/items';
import { Context } from '../lib';

const REPAIR_SHOP: Record<Realm, string | null> = {
  Calimhar: 'r2ses',
  Earand: null,
  Valmorag: 'r4swd2n',
  Niruk: null,
};

const REPAIR_MAN = ['El herrero', 'Grimloz'];

export async function repair({
  sleep,
  when,
  write,
  register,
  plugins: { inventory, navigation, prompt },
}: Context) {
  register('repair', async () => {
    const broken = await getBrokenEquipment();

    if (broken) {
      const realm = await navigation.getRealm();
      const shop = REPAIR_SHOP[realm];

      if (!shop) {
        throw new Error(`No repair shop known in ${realm}`);
      }

      await navigation.execute(shop);
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
    const inInventory = await inventory.getByEffect('ROTO');

    const broken: ItemName[] = [
      ...inInventory.map(x => getItemSustantive(x.name)!).filter(Boolean),
    ];
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
      when(REPAIR_MAN.map(x => `${x} te cobra`)).then(() => true),
      when(REPAIR_MAN.map(x => `${x} te cuenta`)).then(() => false),
      sleep(5).then(() => null),
    ]);

    write('vestir todo');
  }
}
