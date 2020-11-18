import { Context } from './../lib/workflow/Context';

export async function drink({
  run,
  when,
  write,
  plugins: { inventory, navigation, skills },
}: Context) {
  let isFontAvailable = false;
  let isBottleFull = false;

  navigation.onRoomChange(() => (isFontAvailable = false));

  when(
    [
      'Un manantial magico esta aqui.',
      'Una hermosa fuente de marmol blanco esta aqui.',
      'Trazas un circulo delante tuyo del cual emerge un manantial de agua cristalina.',
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
      if (isFontAvailable || (await createFont())) {
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

  async function createFont() {
    if (await skills.can('crear manantial')) {
      return run('cast', ['crear manantial']);
    }
  }

  async function getWaterBottle() {
    return inventory.has({
      'un odre de cuero': 'odre',
      'una cantimplora': 'cantimplora',
    });
  }
}
