import { Context } from './../lib/workflow/Context';

export async function quest({ when, write, plugins: { navigation } }: Context) {
  when(
    /El tesoro parece estar(?: al) (?<dir>\w+) de aqui.../,
    async ({ groups }) => {
      await navigation.go(groups.dir);
      write('carto mapa');
    },
  );
}
