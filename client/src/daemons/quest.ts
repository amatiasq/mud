import { Context } from '../lib';

export async function quest({ when, write, plugins: { navigation } }: Context) {
  when(
    /El tesoro parece estar(?: al) (?<dir>\w+) de aqui.../,
    async ({ groups }) => {
      await navigation.go(groups.dir);
      write('carto mapa');
    },
  );

  when('No has desenterrado nada a pesar de haber cavado bien hondo.', () =>
    write('cavar'),
  );
}
