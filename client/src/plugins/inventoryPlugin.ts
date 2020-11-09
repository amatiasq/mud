import { PluginContext } from '../lib/PluginContext';
import { singleExecution } from '../lib/util/singleExecution';

const INVENTORY_DETECTOR = /Estas llevando:(\n.*)+?\n\n/;

export function inventoryPlugin({ when, write }: PluginContext) {
  let isInitialized = false;
  let items: Record<string, number> = {};

  const refresh = singleExecution(async () => {
    write('inventario');
    await when(INVENTORY_DETECTOR);
  });

  when('No tienes ese objeto.', refresh);

  when(
    INVENTORY_DETECTOR,
    ({ captured }) => {
      const [_, ...inventory] = captured[0]
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      isInitialized = true;
      items = {};

      for (const item of inventory) {
        if (item === 'Nada.') {
          return;
        }

        const match = item.match(/(.*) \((\d+)\)$/);

        if (match) {
          items[match[1]] = parseInt(match[2], 10);
        } else {
          items[item] = 1;
        }
      }
    },
    { captureLength: 1000 },
  );

  return { refresh, has };

  async function has(search: string | string[] | Record<string, string>) {
    if (!isInitialized) {
      await refresh();
    }

    if (typeof search === 'string') {
      return hasSync(search) ? search : null;
    }

    if (Array.isArray(search)) {
      return search.find(hasSync) || null;
    }

    const key = Object.keys(search).find(hasSync);
    return key ? search[key] : null;
  }

  function hasSync(key: string) {
    return items[key];
  }
}
