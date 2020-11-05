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
      console.log(inventory);
      items = inventory;
    },
    { captureLength: 1000 },
  );

  return { refresh, hasItem };

  async function refresh() {
    write('inventario');
    await when(INVENTORY_DETECTOR);
  }

  async function hasItem(item: string) {
    if (!isInitialized) {
      await refresh();
    }

    return items.some(x => x === item);
  }
}
