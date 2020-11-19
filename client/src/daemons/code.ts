import { ClientStorage } from '@amatiasq/client-storage';
import { Context } from '../lib/workflow/Context';

const storage = new ClientStorage<Record<string, number>>('things-in-rooms');

export function code({ when }: Context) {
  when(
    /Salidas: [^\.]+\.\n\n([^<]+)\n<\d+/,
    ({ captured }) => {
      if (captured[1].includes('Solo puedes leer mails de ese buzon.')) {
        return;
      }

      const things = captured[1].split(/\n/).map(x => x.trim());
      const dict = storage.get() || {};
      things.forEach(x => (dict[x] = (dict[x] || 0) + 1));
      storage.set(dict);
    },
    { captureLength: 5000 },
  );
}
