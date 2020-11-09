import { Context } from '../lib/workflow/Context';

export async function bank(
  { write, plugins: { navigation } }: Context,
  take = 2000,
) {
  await navigation.execute('r4s2en');
  write('banco ingresar todo');
  write(`banco retirar ${take}`);
  await navigation.execute('s2w4n');
}
