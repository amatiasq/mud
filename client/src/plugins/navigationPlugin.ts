import { emitter } from '@amatiasq/emitter';

import { PluginContext } from '../lib/PluginContext';
import { PatternPromise } from '../lib/triggers/PatternPromise';
import { PROMPT_DETECTOR } from './promptPlugin';

export function navigationPlugin({ when, write }: PluginContext) {
  let isNavigating = false;
  let landingAtRecall = false;
  let isAtRecall = false;
  let directions: string[] = [];

  const prompt = () => when(PROMPT_DETECTOR);
  const roomChanged = emitter<string[]>();

  when('Plaza de Darkhaven', () => (landingAtRecall = true));

  when(/\nSalidas: ([^\.]+)/, async ({ captured }) => {
    directions = captured[1].split(' ');
    isNavigating = false;
    isAtRecall = landingAtRecall;
    landingAtRecall = false;

    await prompt();
    roomChanged(directions);
  });

  return {
    canGo,
    go,
    execute,
    recall,
    waitForRecall,
    onRoomChange: roomChanged.subscribe,

    get isNavigating() {
      return isNavigating;
    },

    get isAtRecall() {
      return isAtRecall;
    },
  };

  function recall() {
    if (isAtRecall) {
      return Promise.resolve();
    }

    write('recall');
    return when('Plaza de Darkhaven').wait(1);
  }

  function waitForRecall() {
    if (isAtRecall) {
      return new PatternPromise(resolve => resolve());
    }

    return when('Plaza de Darkhaven');
  }

  function canGo(direction: string) {
    return Boolean(get(direction));
  }

  function isClosed(direction: string) {
    const dir = get(direction);
    return dir && dir.includes('(cerrada)');
  }

  async function execute(pattern: string) {
    for (const step of pattern) {
      await go(step);
    }
  }

  async function go(direction: string) {
    if (isNavigating) {
      throw new Error('WTF DUDE');
    }

    const dir = get(direction);

    if (!dir) {
      throw new Error(`Unknown direction '${direction}'`);
    }

    if (isClosed(direction)) {
      write(`abrir ${direction}`);
      await when('Abres la puerta.');
    }

    write(direction);
    isNavigating = true;

    await when('\nSalidas:');
    await prompt();
  }

  function get(direction: string) {
    return directions.find(x => x.startsWith(direction));
  }
}
