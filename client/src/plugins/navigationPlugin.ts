import { emitter } from '@amatiasq/emitter';

import { PluginContext } from '../lib/PluginContext';
import { PatternPromise } from '../lib/triggers/PatternPromise';
import { PROMPT_DETECTOR } from './promptPlugin';

const CLOSED = '(cerrada)';
const aliases = {
  s: 'sur',
  n: 'norte',
  e: 'este',
  w: 'oeste',
  o: 'oeste',
  u: 'arriba',
  d: 'abajo',
  l: 'sureste',
  k: 'suroeste',
  j: 'noreste',
  h: 'noroeste',
};

export function navigationPlugin({ log, when, write }: PluginContext) {
  let isNavigating = false;
  let landingAtRecall = false;
  let isAtRecall = false;
  let directions: string[] = [];

  const prompt = () => when(PROMPT_DETECTOR);
  const roomChanged = emitter<string[]>();

  when(/Plaza de Darkhaven\s+/, () => (landingAtRecall = true));

  when('Puertas? esta cerrada.', async () => {
    const closed = directions.find(x => x.includes(CLOSED));

    if (closed) {
      const dir = closed.replace(CLOSED, '');
      write(`abrir ${dir}`);

      const result = await Promise.any([
        when('Esta cerrada con llave.').then(() => false),
        when('Abres ').then(() => true),
      ]);

      if (result) {
        write(dir);
      }
    }
  });

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

  async function recall() {
    if (isAtRecall) {
      return true;
    }

    write('recall');
    await when('Plaza de Darkhaven');
    await prompt();
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
    return dir && dir.includes(CLOSED);
  }

  async function execute(pattern: string, callback?: () => Promise<any>) {
    if (pattern[0] === 'r') {
      await recall();
      pattern = pattern.substr(1);
    }

    let untilEnd = false;

    for (const step of parsePath(pattern)) {
      if (step.toUpperCase() === 'X') {
        untilEnd = true;
        continue;
      }

      if (untilEnd) {
        while (canGo(step)) {
          if (await move(step)) {
            return false;
          }
        }

        untilEnd = false;
      } else {
        if (await move(step)) {
          return false;
        }
      }
    }

    return true;

    async function move(step: string) {
      try {
        if (!(await go(step))) {
          return true;
        }
      } catch (error) {
        throw new Error(`${error.message} - on ${pattern}`);
      }

      if (typeof callback === 'function') {
        const result = await callback();
        return result === false;
      }
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

      const success = await Promise.any([
        when(/Abres la puertas?\./).then(() => true),
        when('Esta cerrada con llave.').then(() => false),
      ]);

      if (!success) {
        log('Can\t open door');
        return false;
      }
    }

    write(dir.replace(CLOSED, '').trim());
    isNavigating = true;

    await when('\nSalidas:');
    await prompt();

    isNavigating = false;
    return true;
  }

  function get(direction: string) {
    if (direction in aliases) {
      direction = aliases[direction as keyof typeof aliases];
    }

    return directions.find(x => x.startsWith(direction));
  }
}

function parsePath(path: string) {
  return path.replace(/(\d+)(\w)/g, (_, times, dir) => dir.repeat(times));
}
