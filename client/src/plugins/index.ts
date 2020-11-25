import { BasicContext } from '../lib/context/BasicContextCreator';
import { chatPlugin } from './chatPlugin';
import { inventoryPlugin } from './inventoryPlugin';
import { navigationPlugin } from './navigationPlugin';
import { promptPlugin } from './promptPlugin';
import { skillsPlugin } from './skillsPlugin';
import { statsPlugin } from './statsPlugin';

const plugins = {
  chat: chatPlugin,
  inventory: inventoryPlugin,
  navigation: navigationPlugin,
  prompt: promptPlugin,
  skills: skillsPlugin,
  stats: statsPlugin,
} as const;

// -- Dirty implementation

type plugins = typeof plugins;
type UnPromisify<T> = T extends PromiseLike<infer U> ? U : T;

export type PluginMap = {
  [name in keyof plugins]: UnPromisify<ReturnType<plugins[name]>>;
};

export type BindedPluginMap = {
  [name in keyof PluginMap]: UnPromisify<ReturnType<PluginMap[name]>>;
};

export async function initializePlugins(
  context: (name: string) => BasicContext,
) {
  const promises = Object.entries(plugins).map(async ([name, plugin]) => [
    name,
    await plugin(context(name)),
  ]);

  const entries = await Promise.all(promises);
  return Object.fromEntries(entries) as PluginMap;
}
