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

const PROMPT_DETECTOR = new RegExp(
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
    return this.total ? (1 / this.total) * this.current : 0;
  }
}

export async function promptPlugin({
  watch,
  waitFor,
  write,
  printLogs,
}: PluginContext) {
  let isInvisible = false;

  printLogs();

  const stats = {
    hp: new Stat(),
    mana: new Stat(),
    mv: new Stat(),
    exp: 0,
    gold: 0,
    enemy: null as number | null,
  };

  const update = emitter<typeof stats>();

  await waitFor(PROMPT_DETECTOR).timeout(1).catch(setPrompt);

  watch(PROMPT_DETECTOR, ({ groups: g }) => {
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

  return {
    waitForPrompt,
    getPercent,
    onUpdate: update.subscribe,

    get isExhausted() {
      return stats.mv.current <= 15;
    },

    get isInjured() {
      return stats.hp.percent !== 1;
    },

    get needsHospital() {
      return stats.hp.percent < 0.3;
    },

    get isInDanger() {
      return stats.hp.percent < 0.1;
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
    return waitFor(PROMPT_DETECTOR);
  }

  function getPercent(stat: 'hp' | 'mana' | 'mv') {
    return stats[stat].percent;
  }
}

function toInt(value: string) {
  return parseInt(value.replace(/,/g, ''), 10);
}
