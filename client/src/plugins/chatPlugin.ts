import { ClientStorage } from '@amatiasq/client-storage';

import { createPlugin } from '../lib/createPlugin';
import { PatternResult } from '../lib/triggers/PatternResult';
import { datetime, DateTime } from '../lib/util/dateTime';
import { requestNotificationPermission } from '../lib/util/requestNotificationPermission';

type Message = [DateTime, string, string, string];
type History = ClientStorage<Message[]>;

const beepAudio = new Audio(
  'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=',
);

const version = { version: 2 };
const date = () =>
  new Date()
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d\d\dZ/, '');

const receive =
  (log: History, type: string) =>
  ({ groups: { name, message } }: PatternResult) => {
    console.log(`MESSAGE [${type}] ${date()} => ${name} =>`, message);
    addMessage(log, { from: name, message });

    if (!name.startsWith('[Orden')) {
      notify(`${name}: ${message}`);
    }
  };

const sent =
  (log: History, type: string) =>
  ({ groups: { name, message } }: PatternResult) => {
    console.log(`SENT [${type}] ${date()} => ${name} =>`, message);
    addMessage(log, { to: name, message });
  };

export const chatPlugin = createPlugin(
  ({ when, write }) => {
    // const say = new ClientStorage<Record<string, Message[]>>('chat:say');
    const chat = new ClientStorage<Message[]>('chat:global', version);
    const faction = new ClientStorage<Message[]>('chat:faction', version);
    const order = new ClientStorage<Message[]>('chat:order', version);
    const novice = new ClientStorage<Message[]>('chat:novice', version);
    const tell = new ClientStorage<Message[]>('chat:tell', version);
    const whisper = new ClientStorage<Message[]>('chat:whisper', version);

    (window as any).chat = (count = 0) => ({
      global: chat.get() ? chat.get()!.slice(count) : [],
      faction: faction.get() ? faction.get()!.slice(count) : [],
      order: order.get() ? order.get()!.slice(count) : [],
      novice: novice.get() ? novice.get()!.slice(count) : [],
      tell: tell.get() ? tell.get()!.slice(count) : [],
      whisper: whisper.get() ? whisper.get()!.slice(count) : [],
    });

    channel(
      'General',
      chat,
      /(?<name>\w+) charla '(?<message>[^']+)'/,
      /Charlas '(?<message>[^']+)'/,
    );

    channel(
      'Novatos',
      novice,
      /(?<name>\[Novatos: [^\]]+\]): '(?<message>[^']+)'/,
      /(?<name>\[Novatos\]): '(?<message>[^']+)'/,
    );

    channel(
      'Order',
      order,
      /(?<name>\[Orden: [^\]]+\]): '(?<message>[^']+)'/,
      /(?<name>\[Orden\]): '(?<message>[^']+)'/,
    );

    channel(
      'Faccion',
      faction,
      /(?<name>\[Faccion: [^\]]+\]): '(?<message>[^']+)'/,
      /(?<name>\[Faccion\]): '(?<message>[^']+)'/,
    );

    channel(
      'Whisper',
      whisper,
      /(?<name>.+) te susurra '(?<message>[^']+)'/,
      /Susurras a (?<name>.+) '(?<message>[^']+)'/,
    );

    const receiveTell = receive(tell, 'Tell');

    when(
      [
        /(?<name>.+) te cuenta '(?<message>[^']+)'/,
        /(?<name>.+) te responde '(?<message>[^']+)'/,
      ],
      result => {
        receiveTell(result);
        handleAutoResponses(result.groups);
      },
    );

    when(
      [
        /Cuentas a (?<name>.+) '(?<message>[^']+)'/,
        /Respondes a (?<name>.+) '(?<message>[^']+)'/,
      ],
      sent(tell, 'Tell'),
    );

    when(
      /(?<name>\w+) te ha desafiado a un combate en la arena!/,
      ({ groups }) => notify(`[ARENA] w/ ${groups.name}`),
    );

    function channel(
      name: string,
      storage: History,
      received: RegExp,
      sentPattern: RegExp,
    ) {
      when(received, receive(storage, name));
      when(sentPattern, sent(storage, name));
    }

    function handleAutoResponses({ name, message }: Record<string, string>) {
      const tokens = {
        re: /^porfa re(sponde(me)?)? /,
        [`tell ${name}`]: /^porfa di(me)? /,
        [`susurrar ${name}`]: /^porfa susurra(me)? /,
      };

      for (const [response, token] of Object.entries(tokens)) {
        if (token.test(message)) {
          write(`${response} ${message.replace(token, '')}`);
        }
      }
    }
  },
  () => () => ({}),
);

type msg = { message: string };

async function notify(content: string) {
  beepAudio.play();
  await requestNotificationPermission();
  return new Notification(content);
}

function addMessage(log: History, partial: { from: string } & msg): Message;
function addMessage(log: History, partial: { to: string } & msg): Message;
function addMessage(
  log: History,
  partial: { from?: string; to?: string } & msg,
): Message {
  const message: Message = [
    datetime(new Date()),
    partial.from || 'me',
    partial.to || 'me',
    partial.message,
  ];

  log.set([...(log.get() || []), message]);
  return message;
}
