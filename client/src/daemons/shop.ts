import { Realm } from '../data/areas';
import { Context } from './../lib/workflow/Context';

interface Location {
  path: Partial<Record<Realm, string>>;
  name?: string;
  amount?: number;
}

const locations: Record<string, Location> = {
  viajar: {
    path: { Calimhar: 'r2s3wn' },
    amount: 5,
  },
};

export async function shop({ when, write, register }: Context) {
  when(/pone todo en una bolsa y te la da\./, async () => {
    write('coger todo bolsa');
    write('examinar bolsa');

    await when(/Una bolsa contiene:\n\s+Nada\./);
    write('tirar bolsa');
  });

  register(
    'buy',
    async (
      { when, write, plugins: { navigation } }: Context,
      item: string,
      amount: number,
    ) => {
      if (!(item in locations)) {
        throw new Error(`Unknown item type "${item}"`);
      }

      const realm = await navigation.getRealm();
      const config = locations[item as keyof typeof locations];
      const path = config.path[realm];
      const name = config.name || item;

      if (!amount) {
        amount = config.amount || 1;
      }

      if (!path) {
        throw new Error(`Can't find shop for ${item} on realm ${realm}`);
      }

      await navigation.execute(path);
      write(`comprar ${amount} ${name}`);

      return Promise.any([
        when('Lo siento, esta cerrado, vuelve mas tarde.').then(() => false),
        when(['Compras ', 'pone todo en una bolsa y te la da']).then(
          () => true,
        ),
      ]);
    },
  );
}
