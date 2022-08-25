import { Context } from '../lib';

export async function drink({
  run,
  when,
  write,
  plugins: { inventory, navigation, skills },
}: Context) {
  let isFontAvailable = false;
  let isBottleFull = false;
  let isThirsty = true;

  navigation.onRoomChange(() => (isFontAvailable = false));

  when(
    [
      'Un manantial magico esta aqui.',
      'Una hermosa fuente de marmol blanco esta aqui.',
      'Trazas un circulo delante tuyo del cual emerge un manantial de agua cristalina.',
    ],
    async () => {
      setTimeout(() => (isFontAvailable = true), 100);

      if (!isBottleFull) {
        const bottle = await getWaterBottle();

        if (bottle) {
          write(`llenar ${bottle}`);
          isBottleFull = true;
        }
      }

      if (isThirsty) {
        write('beber');
        isThirsty = false;
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
        isThirsty = true;
        return;
      }

      write(`beber ${bottle}`);
      isBottleFull = false;

      if (await skills.can('crear agua')) {
        if ((await skills.castSpell('crear agua', bottle)) === skills.CASTED) {
          isBottleFull = true;
        }
      }
    },
  );

  async function createFont() {
    if (await skills.can('crear manantial')) {
      return run('cast', 'crear manantial');
    }
  }

  async function getWaterBottle() {
    return inventory.has({
      'un odre de cuero': 'odre',
      'una cantimplora': 'cantimplora',
    });
  }
}
