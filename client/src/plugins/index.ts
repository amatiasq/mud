import { PluginContext } from '../lib/PluginContext';
import { chatPlugin } from './chatPlugin';
import { inventoryPlugin } from './inventoryPlugin';
import { navigationPlugin } from './navigationPlugin';
import { promptPlugin } from './promptPlugin';
import { skillsPlugin } from './skillsPlugin';

const plugins = {
  chat: chatPlugin,
  inventory: inventoryPlugin,
  navigation: navigationPlugin,
  prompt: promptPlugin,
  skills: skillsPlugin,
};

// -- Dirty implementation

type plugins = typeof plugins;
type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export type PluginMap = {
  [name in keyof plugins]: UnPromisify<ReturnType<plugins[name]>>;
};

export async function initializePlugins(
  context: (name: string) => PluginContext,
) {
  const promises = Object.entries(plugins).map(async ([name, plugin]) => [
    name,
    await plugin(context(name)),
  ]);

  const entries = await Promise.all(promises);
  return Object.fromEntries(entries) as PluginMap;
}
