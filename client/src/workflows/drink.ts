import { Context } from './../lib/workflow/Context';

export async function drink({
  when,
  write,
  runForever,
  plugins: { inventory, navigation },
}: Context) {
  let isFontAvailable = false;
  let isBottleFull = false;

  navigation.onRoomChange(() => (isFontAvailable = false));

  when(
    [
      'Un manantial magico esta aqui.',
      'Una hermosa fuente de marmol blanco esta aqui.',
    ],
    async () => {
      isFontAvailable = true;

      if (!isBottleFull) {
        const bottle = await getWaterBottle();

        console.log({ bottle });

        if (bottle) {
          write(`llenar ${bottle}`);
          isBottleFull = true;
        }
      }
    },
  );

  when(
    [
      'Te apetece dar un sorbo a algo refrescante.',
      'Tienes sed.',
      'Estas realmente sediento.',
      'Estas MUERTO de SED!',
      'Estas en peligro de deshidratacion.',
    ],
    async () => {
      if (isFontAvailable) {
        write('beber');
      } else {
        const bottle = await getWaterBottle();

        if (bottle) {
          write(`beber ${bottle}`);
        } else {
          console.log('No hay fuente de agua');
        }
      }
    },
  );

  await runForever();

  async function getWaterBottle() {
    if (await inventory.hasItem('un odre de cuero')) {
      return 'odre';
    }
  }
}
