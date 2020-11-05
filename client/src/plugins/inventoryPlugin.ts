import { PluginContext } from '../lib/PluginContext';

export function inventoryPlugin({ when, write }: PluginContext) {
  const INVENTORY_DETECTOR = /Estas llevando:(\n.*)+?\n\n/;

  let isInitialized = false;
  let items: string[] = [];

  when('No tienes ese objeto.', refresh);

  when(
    INVENTORY_DETECTOR,
    ({ captured }) => {
      const [_, ...inventory] = captured[0]
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      isInitialized = true;
      items = inventory;
    },
    { captureLength: 1000 },
  );

  return { refresh, has };

  async function refresh() {
    write('inventario');
    await when(INVENTORY_DETECTOR);
  }

  async function has(search: string | string[] | Record<string, string>) {
    if (!isInitialized) {
      await refresh();
    }

    if (typeof search === 'string') {
      return items.find(x => x === search);
    }

    if (Array.isArray(search)) {
      return items.find(x => search.includes(x));
    }

    const found = items.find(x => x in search);
    return found && search[found];
  }
}
