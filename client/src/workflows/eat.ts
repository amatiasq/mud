import { SingleEntryPlugin } from 'webpack';
import { Context } from './../lib/workflow/Context';

export async function eat({
  sleep,
  watch,
  write,
  waitFor,
  runForever,
  plugins: { inventory, navigation: nav },
}: Context) {
  const EXPECTED_FOOD = 5;
  const DEFAULT_FOOD_NAME = 'chuleta';
  let foodInInventory = 0;

  watch(['Tienes hambre.', 'Estas realmente hambriento.'], eatSomething);

  watch(['Estas terriblemente hambriento.', 'Estas HAMBRIENTO!'], async () => {
    if (await eatSomething()) {
      return;
    }

    await buyFood();
    await eatSomething();
  });

  await runForever();

  async function eatSomething() {
    const food = await getFood();
    if (!food) return false;

    write(`comer ${food}`);
    inventory.refresh();
    return true;
  }

  async function buyFood() {
    await nav.recall();
    await nav.execute('ssen');

    write(`comprar ${EXPECTED_FOOD - foodInInventory} ${DEFAULT_FOOD_NAME}`);
  }

  async function getFood() {
    if (inventory.hasItem('una bolsa')) {
      write('coger todo bolsa');
      write('examinar bolsa');

      const { captured } = await waitFor(/Una bolsa contiene:\n\s+(Nada)?/);
      if (captured[1]) {
        write('tirar bolsa');
      }
    }

    if (inventory.hasItem('un chorizo')) return 'chorizo';
    if (inventory.hasItem('pavo cocinado')) return 'pavo';
    if (inventory.hasItem('chuleta de cordero')) return 'chuleta';
    if (inventory.hasItem('loncha de salami')) return 'salami';
    if (inventory.hasItem('pierna de cordero')) return 'pierna';
    if (inventory.hasItem('ricas longanizas')) return 'longanizas';
  }
}
