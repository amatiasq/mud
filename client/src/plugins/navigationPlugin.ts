import { emitter } from '@amatiasq/emitter';

import { PluginContext } from '../lib/PluginContext';

export function navigationPlugin({ watch, waitFor, write }: PluginContext) {
  let isNavigating = false;
  let landingAtRecall = false;
  let isAtRecall = false;
  let directions: string[] = [];

  const roomChanged = emitter<string[]>();

  watch('Plaza de Darkhaven', () => (landingAtRecall = true));

  watch(/\nSalidas: ([^\.]+)/, ({ captured }) => {
    directions = captured[1].split(' ');
    roomChanged(directions);
    isNavigating = false;
    isAtRecall = landingAtRecall;
    landingAtRecall = false;
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
    return waitFor('Plaza de Darkhaven').wait(1);
  }

  function waitForRecall() {
    if (isAtRecall) {
      return Promise.resolve();
    }

    return waitFor('Plaza de Darkhaven');
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
    const dir = get(direction);

    if (!dir) {
      throw new Error(`Unknown direction '${direction}'`);
    }

    if (isClosed(direction)) {
      write(`abrir ${direction}`);
      await waitFor('Abres la puerta.');
    }

    write(direction);
    isNavigating = true;
    await waitFor('\nSalidas: ');
  }

  function get(direction: string) {
    return directions.find(x => x.startsWith(direction));
  }
}
