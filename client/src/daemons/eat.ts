import { Context } from './../lib/workflow/Context';

export async function eat({
  run,
  when,
  write,
  plugins: { inventory, navigation: nav, skills },
}: Context) {
  const EXPECTED_FOOD = 1;
  const DEFAULT_FOOD_NAME = 'chuleta';

  when(['Tienes hambre.', 'Estas realmente hambriento.'], eatSomething);

  when(['Estas terriblemente hambriento.', 'Estas HAMBRIENTO!'], async () => {
    if (await eatSomething()) {
      return;
    }

    if (nav.isAtRecall) {
      await buyFood();
      await eatSomething();
    }
  });

  async function eatSomething() {
    const food = await getFoodFromInventory();

    if (food) {
      write(`comer ${food}`);
      inventory.refresh();
      return true;
    }

    return await createFood();
  }

  async function createFood() {
    if (
      !(await skills.has('crear comida')) ||
      !(await run('cast', ['crear comida']))
    ) {
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
    await nav.execute('2sen');

    write(`comprar ${EXPECTED_FOOD} ${DEFAULT_FOOD_NAME}`);

    await Promise.any([
      when('Compras una chuleta de cordero.'),
      when('El carnicero pone todo en una bolsa y te la da.').then(
        getFoodFromBag,
      ),
    ]);

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
      'un extranyo hongo': 'hongo',
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
