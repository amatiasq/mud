import {
  getItemSustantive,
  ITEM_ARTICLE,
  ITEM_SUSTANTIVES,
  UNWEAR,
  WEAR,
} from '../data/items';
import { Context } from '../lib';
import { concatRegexes } from '../lib/util/concatRegexes';

export async function wear(
  { run, when, write, plugins: { skills } }: Context,
  ...args: string[]
) {
  const items = args.length ? args : ITEM_SUSTANTIVES;

  for (const item of items) {
    for (let i = 0; i < 5; i++) {
      if (await wearItem(item)) {
        break;
      }
    }
  }

  async function wearItem(item: string) {
    write(`coger "${item}"`);

    const pickedUp = await Promise.any([
      when(`No hay ningun ${item} aqui.`)
        .wait(8)
        .then(() => false),
      when(
        concatRegexes(/Coges/, ITEM_ARTICLE, /(?: (?:\\w|�)+)* /i, item),
      ).then(() => true),
    ]);

    if (!pickedUp) {
      console.warn(`Couldn't pick up "${item}"`);
      return true;
    }

    if (await skills.can('identificar')) {
      let isMetallic = false;
      const sus = when(
        ' es un(a) armadura_metalica,',
        () => (isMetallic = true),
      );
      const identified = await run('cast', 'identificar', item);
      sus.unsubscribe();

      if (!identified) {
        console.warn(`Couldn't identifiy "${item}"`);
        await tirar(item);
        return false;
      }

      if (isMetallic) {
        await tirar(item);
        return false;
      }
    }

    write(`vestir "${item}"`);

    const result = await Promise.any([
      when(WEAR).then(() => true),
      when(UNWEAR).then(({ groups }) => groups.item),
      when([
        /Debes ser nivel \w+ para usar este objeto./,
        'No puedes vestir eso, necesita repararse.',
        'Te esta prohibido usar ese objeto.',
      ]).then(() => false),
    ]);

    if (result === false) {
      await tirar(item);
      return false;
    }

    if (typeof result === 'string') {
      const other = getItemSustantive(result);

      if (other) {
        await run('cast', 'identificar', other);
        write(`poner ${other} mochila`);
        await when('Pones ');
      }
    }

    return true;
  }

  function tirar(item: string) {
    write(`tirar "${item}"`);
    return when('Tiras ');
  }
}
