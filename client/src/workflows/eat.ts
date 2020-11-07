import { Context } from './../lib/workflow/Context';

export async function eat({
  when,
  write,
  runForever,
  plugins: { inventory, navigation: nav, skills, prompt },
}: Context) {
  const EXPECTED_FOOD = 1;
  const DEFAULT_FOOD_NAME = 'chuleta';

  when(['Tienes hambre.', 'Estas realmente hambriento.'], eatSomething);

  when(['Estas terriblemente hambriento.', 'Estas HAMBRIENTO!'], async () => {
    if ((await eatSomething()) || (await createFood())) {
      return;
    }

    await buyFood();
    await eatSomething();
  });

  await runForever();

  async function eatSomething() {
    const food = await getFoodFromInventory();

    if (food) {
      write(`comer ${food}`);
      inventory.refresh();
    }

    return true;
  }

  async function createFood() {
    if (!(await skills.castSpell('crear comida'))) {
      return false;
    }

    write('coger seta');

    try {
      await when('Coges una seta magica.').timeout(3);
      write('comer seta');
      return true;
    } catch (err) {
      return false;
    }
  }

  async function buyFood() {
    await nav.recall();
    await nav.execute('2sen');

    write(`comprar ${EXPECTED_FOOD} ${DEFAULT_FOOD_NAME}`);
    await when('El carnicero pone todo en una bolsa y te la da.');
    await getFoodFromBag();
    await nav.execute('sw2n');
  }

  async function getFoodFromInventory() {
    await getFoodFromBag();

    return await inventory.has({
      'un chorizo': 'chorizo',
      'pavo cocinado': 'pavo',
      'una chuleta de cordero': 'chuleta',
      'loncha de salami': 'salami',
      'pierna de cordero': 'pierna',
      'ricas longanizas': 'longanizas',
    });
  }

  async function getFoodFromBag() {
    if (await inventory.has('una bolsa')) {
      write('coger todo bolsa');
      write('examinar bolsa');

      const { captured } = await when(/Una bolsa contiene:\n\s+(Nada)?/);
      if (captured[1]) {
        write('tirar bolsa');
      }
    }
  }
}
