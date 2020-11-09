import { emitter } from '@amatiasq/emitter';

import { PluginContext } from '../lib/PluginContext';

const PROMPT = [
  '&W<',
  '&R%h/%Hhp ',
  '&C%m/%Mm ',
  '&G%v/%Vmv ',
  '&P%Xxp ',
  '&Y%gg',
  '&W> ',
  '&W%A ',
  '\n',
].join('');

const FPROMPT = PROMPT.replace('&W>', ' &R%E&W>');

export const PROMPT_DETECTOR = new RegExp(
  [
    '<',
    '(?<hpCurr>\\d+)/(?<hpTotal>\\d+)hp ',
    '(?<mCurr>\\d+)/(?<mTotal>\\d+)m ',
    '(?<mvCurr>\\d+)/(?<mvTotal>\\d+)mv ',
    '(?<exp>(\\d|,)+)xp ',
    '(?<gold>(\\d|,)+)g',
    '( \\((?<enemy>\\d+)%\\))?',
    '> (?<invis>I)?',
  ].join(''),
);

class Stat {
  total = 0;
  current = 0;

  get percent() {
    const result = this.total ? (1 / this.total) * this.current : 0;
    return Math.round(result * 100) / 100;
  }
}

export async function promptPlugin({ when, write }: PluginContext) {
  let isInvisible = false;

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
    waitForPrompt,
    getPercent,
    until,
    onUpdate: update.subscribe,

    get isExhausted() {
      return stats.mv.current <= 15;
    },

    // get isInjured() {
    //   return stats.hp.percent !== 1;
    // },

    get needsHospital() {
      return stats.hp.percent < 0.3;
    },

    get isInDanger() {
      return stats.hp.percent < 0.1;
    },

    get isFighting() {
      return stats.isFighting;
    },

    get isInvisible() {
      return isInvisible;
    },
  };

  function setPrompt() {
    write(`prompt ${PROMPT}`);
    write(`fprompt ${FPROMPT}`);
  }

  function waitForPrompt() {
    return when(PROMPT_DETECTOR);
  }

  function getPercent(stat: 'hp' | 'mana' | 'mv') {
    return stats[stat].percent;
  }

  function until(predicate: (stats: Stats) => boolean) {
    if (predicate(stats)) {
      return true;
    }

    return new Promise(resolve => {
      const unsubscribe = update.subscribe((stats: Stats) => {
        if (predicate(stats)) {
          unsubscribe();
          resolve(stats);
        }
      });
    });
  }
}

function toInt(value: string) {
  return parseInt(value.replace(/,/g, ''), 10);
}
