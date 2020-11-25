import { emitter } from '@amatiasq/emitter';

import { createPlugin } from '../lib/createPlugin';
import { concatRegexes } from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';

const PROMPT = [
  '&W<',
  '&R%h/%Hhp ',
  '&C%m/%Mm ',
  '&G%v/%Vmv ',
  '&P%Xxp ',
  '&Y%gg ',
  '&W&0%d',
  '&W> ',
  '&W%A ',
  '\n',
].join('');

const FPROMPT = PROMPT.replace('&W>', ' &R%E&W>');

const captureProgress = (name: string) =>
  concatRegexes(int(`${name}Curr`), '/', int(`${name}Total`), `${name} `);

// prettier-ignore
export const PROMPT_DETECTOR = concatRegexes(
  /</,
  captureProgress('hp'),
  captureProgress('m'),
  captureProgress('mv'),
  int('exp'), /xp /,
  int('gold'), /g /,
  int('favor'),
  /( \((?<enemy>\d+)%\))?/,
  /> (?<invis>I)?/,
);

class Stat {
  total = 0;
  current = 0;

  get percent() {
    const result = this.total ? (1 / this.total) * this.current : 0;
    return Math.round(result * 100) / 100;
  }
}

const stats = {
  hp: new Stat(),
  mana: new Stat(),
  mv: new Stat(),
  exp: 0,
  gold: 0,
  enemy: null as number | null,

  get isFighting() {
    return stats.enemy !== null;
  },
};

type Stats = typeof stats;

export const promptPlugin = createPlugin(
  ({ when, write }) => {
    let isInvisible = false;
    const update = emitter<typeof stats>();

    when(PROMPT_DETECTOR)
      .timeout(1)
      .catch(setPrompt)
      .finally(() => {
        when(PROMPT_DETECTOR, ({ groups: g }) => {
          stats.hp.current = toInt(g.hpCurr);
          stats.hp.total = toInt(g.hpTotal);
          stats.mana.current = toInt(g.mCurr);
          stats.mana.total = toInt(g.mTotal);
          stats.mv.current = toInt(g.mvCurr);
          stats.mv.total = toInt(g.mvTotal);
          stats.exp = toInt(g.exp);
          stats.gold = toInt(g.gold);
          stats.enemy = g.enemy ? toInt(g.enemy) : null;
          isInvisible = Boolean(g.invis);
          update(stats);
        });
      });

    return {
      getIsInvisible: () => isInvisible,
      onUpdate: update.subscribe,
    };

    function setPrompt() {
      write(`prompt ${PROMPT}`);
      write(`fprompt ${FPROMPT}`);
    }
  },
  ({ getIsInvisible, onUpdate }) => ({ when }) => {
    return {
      getPercent,
      getValue,
      until,
      whenFresh,
      onUpdate,

      get isFighting() {
        return stats.isFighting;
      },

      get isInvisible() {
        return getIsInvisible();
      },
    };

    function whenFresh() {
      return until(stats => {
        console.log(
          stats.hp.percent,
          stats.mana.percent,
          stats.mv.percent,
          stats.hp.percent === 1 &&
            stats.mana.percent === 1 &&
            stats.mv.percent === 1,
        );
        return (
          stats.hp.percent === 1 &&
          stats.mana.percent === 1 &&
          stats.mv.percent === 1
        );
      });
    }

    function getPercent(stat: 'hp' | 'mana' | 'mv') {
      return stats[stat].percent;
    }

    function getValue(stat: 'gold' | 'exp'): number;
    function getValue(stat: 'enemy'): number | null;
    function getValue(stat: 'gold' | 'exp' | 'enemy') {
      return stats[stat];
    }

    function until(predicate?: (stats: Stats) => boolean) {
      if (!predicate) {
        return when(PROMPT_DETECTOR);
      }

      if (predicate(stats)) {
        return true;
      }

      return new Promise(resolve => {
        const unsubscribe = onUpdate((stats: Stats) => {
          if (predicate(stats)) {
            unsubscribe();
            resolve(stats);
          }
        });
      });
    }
  },
);
