import { wait } from '../lib/util/wait';
import { Context } from './../lib/workflow/Context';

export async function eat({
  when,
  write,
  runForever,
  plugins: { inventory, navigation: nav },
}: Context) {
  const EXPECTED_FOOD = 5;
  const DEFAULT_FOOD_NAME = 'chuleta';
  let foodInInventory = 0;

  when(['Tienes hambre.', 'Estas realmente hambriento.'], eatSomething);

  when(['Estas terriblemente hambriento.', 'Estas HAMBRIENTO!'], async () => {
    console.log('hungry');

    if (await eatSomething()) {
      return;
    }

    await buyFood();
    await eatSomething();
  });

  await runForever();

  async function eatSomething() {
    console.log('eatSomething');

    const food = await getFood();
    if (!food) return false;

    write(`comer ${food}`);
    inventory.refresh();
    return true;
  }

  async function buyFood() {
    await nav.recall();
    await nav.execute('2sen');

    write(`comprar ${EXPECTED_FOOD - foodInInventory} ${DEFAULT_FOOD_NAME}`);
    await when('El carnicero pone todo en una bolsa y te la da.');
    await getFoodFromBag();

    await nav.execute('sw2n');
  }

  async function getFood() {
    if (await inventory.has('una bolsa')) {
      await getFoodFromBag();
    }

    return await inventory.has({
      'un chorizo': 'chorizo',
      'pavo cocinado': 'pavo',
      'chuleta de cordero': 'chuleta',
      'loncha de salami': 'salami',
      'pierna de cordero': 'pierna',
      'ricas longanizas': 'longanizas',
    });
  }

  async function getFoodFromBag() {
    write('coger todo bolsa');
    write('examinar bolsa');

    const { captured } = await when(/Una bolsa contiene:\n\s+(Nada)?/);
    if (captured[1]) {
      write('tirar bolsa');
    }
  }
}
