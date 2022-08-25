import { Context } from '../lib';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';

export async function bank(
  { when, write, plugins: { navigation } }: Context,
  take?: number,
) {
  const INGRESS = concatRegexes(
    /Ingresas /,
    int(),
    / monedas? de oro en tu cuenta bancaria./,
  );
  const EXTRACT = concatRegexes(
    /Retiras /,
    int(),
    / monedas? de oro de tu cuenta bancaria./,
  );

  await navigation.execute('r4s2en');

  write('banco saldo');

  const { groups } = await when(
    concatRegexes(
      /Estas llevando /,
      int('carring'),
      / monedas de oro.\n/,
      /Tienes /,
      int('balance'),
      / monedas de oro en el banco.\n/,
      /Lo que hace un total de /,
      int('total'),
      / monedas de oro.\n/,
    ),
  );

  const carring = toInt(groups.carring);
  // const balance = toInt(groups.balance);
  const total = toInt(groups.total);
  const final = take == null ? Math.max(Math.ceil(total * 0.01), 2000) : take;

  if (carring < final) {
    write(`banco retirar ${final - carring}`);
    await when(EXTRACT);
  } else if (carring > final) {
    write(`banco ingresar ${carring - final}`);
    await when(INGRESS);
  }

  await navigation.execute('s2w4n');
}
