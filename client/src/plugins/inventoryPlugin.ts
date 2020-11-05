import { PluginContext } from '../lib/PluginContext';

export function inventoryPlugin({ watch, write, waitFor }: PluginContext) {
  let isInitialized = false;
  let items: string[] = [];

  watch(
    /Estas llevando:(\n.*)+?\n\n/,
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

  return { refresh: request, hasItem };

  async function request() {
    write('inventario');
    await waitFor('Estas llevando');
  }

  async function hasItem(item: string) {
    if (!isInitialized) {
      await request();
    }

    return items.some(x => x === item);
  }
}
