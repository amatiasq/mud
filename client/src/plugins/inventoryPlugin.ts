import { createPlugin } from '../lib/createPlugin';
import {
  concatRegexes,
  concatRegexesUnescaped,
} from '../lib/util/concatRegexes';
import { int, toInt } from '../lib/util/int';
import { singleExecution } from '../lib/util/singleExecution';

interface ItemData {
  name: string;
  amount: number;
  effects: string[];
}

type ItemList = Record<string, ItemData>;
type ItemSearch = string | string[] | Record<string, string>;

const CONTENT = /\n(?<content>(?:.|\n)*)\n[^ ]/;
const INVENTORY_DETECTOR = concatRegexes(/Estas llevando:/, CONTENT);
const ITEM_EFECTS = /(?<effects>(?:\(\w[^\)]+\w\) )*)/;
const ITEM_AMOUNT = concatRegexesUnescaped('(?: \\(', int('amount'), '\\))?');
const ITEM_MATCHER = concatRegexes(
  /^/,
  ITEM_EFECTS,
  /(?<name>\w[^\(\)]*\w)/,
  ITEM_AMOUNT,
  /$/,
);

export const inventoryPlugin = createPlugin(
  ({ when, write }) => {
    let isInitialized = false;
    let items: ItemList = {};

    const refresh = singleExecution(async () => {
      write('inventario');
      await when(INVENTORY_DETECTOR);
    });

    when('No tienes ese objeto.', refresh);

    when(
      INVENTORY_DETECTOR,
      ({ groups }) => {
        isInitialized = true;
        items = parseItems(groups.content);
      },
      { captureLength: 1000 },
    );

    return {
      refresh,
      parseItems,
      ensureInitialized: () => isInitialized || refresh(),
      getItems: () => items,
    };

    function parseItems(captured: string) {
      const list = captured
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      const result: ItemList = {};

      for (const item of list) {
        if (item === 'Nada.') {
          return {};
        }

        const match = item.match(ITEM_MATCHER);

        if (!match) {
          console.error(`Can't match item "${item}"`);
          continue;
        }

        const { effects, name, amount } = match.groups!;

        result[name] = {
          name,
          amount: amount ? toInt(amount) : 1,
          effects: effects
            .replace(/^\s*\(|\)\s*$/g, '')
            .split(') (')
            .filter(Boolean),
        };
      }

      return result;
    }
  },
  ({ refresh, parseItems, ensureInitialized, getItems }) =>
    ({ when, write }) => {
      return {
        refresh,
        has,
        hasIn,
        hasInBackpack: hasIn.bind(null, 'mochila'),
        getByEffect,
      };

      async function has(search: ItemSearch) {
        await ensureInitialized();
        return searchInList(getItems(), search);
      }

      async function getByEffect(effect: string) {
        await ensureInitialized();
        return Object.values(getItems()).filter(x =>
          x.effects.includes(effect),
        );
      }

      async function hasIn(container: string, search: ItemSearch) {
        write(`examinar ${container}`);

        const match = await when.any(
          when('No ves eso aqui.').then(() => null),
          when(
            concatRegexes(/Cuando miras dentro ves:\n.+ contiene:/, CONTENT),
            {
              captureLength: 1000,
            },
          ),
        );

        if (!match) {
          return false;
        }

        const items = parseItems(match.groups.content);
        console.log('IN', container, items);
        return searchInList(items, search);
      }

      function searchInList(items: ItemList, search: ItemSearch) {
        if (typeof search === 'string') {
          return items[search] ? search : null;
        }

        if (Array.isArray(search)) {
          return search.find(x => items[x]) || null;
        }

        const key = Object.keys(search).find(x => items[x]);
        return key ? search[key] : null;
      }
    },
);
