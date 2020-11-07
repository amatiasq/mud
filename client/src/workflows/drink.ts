import { Context } from './../lib/workflow/Context';

export async function drink({
  when,
  write,
  runForever,
  plugins: { inventory, navigation, skills },
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
      // 'Estas sediento.',
      'Estas realmente sediento.',
      'Estas MUERTO de SED!',
      'Estas en peligro de deshidratacion.',
    ],
    async () => {
      if (isFontAvailable) {
        write('beber');
        return;
      }

      const bottle = await getWaterBottle();

      if (!bottle) {
        console.log('No hay fuente de agua');
        return;
      }

      write(`beber ${bottle}`);
      await skills.castSpell('crear agua', bottle);
    },
  );

  await runForever();

  async function getWaterBottle() {
    return inventory.has({
      'un odre de cuero': 'odre',
      'una cantimplora': 'cantimplora',
    });
  }
}
