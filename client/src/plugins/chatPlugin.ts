import { ClientStorage } from '@amatiasq/client-storage';

import { PluginContext } from '../lib/PluginContext';
import { PatternResult } from '../lib/triggers/PatternResult';
import { datetime, DateTime } from '../lib/util/dateTime';
import { requestNotificationPermission } from '../lib/util/requestNotificationPermission';

type Message = [DateTime, string, string, string];
type History = ClientStorage<Message[]>;

const version = { version: 2 };

const receive = (log: History) => ({
  groups: { name, message },
}: PatternResult) => {
  console.log(`MESSAGE => ${name} =>`, message);
  addMessage(log, { from: name, message });

  if (!name.startsWith('[Orden')) {
    notify(`${name}: ${message}`);
  }
};

const sent = (log: History) => ({ groups: { name, message } }: PatternResult) =>
  addMessage(log, { to: name, message });

export function chatPlugin({ when, write }: PluginContext) {
  // const say = new ClientStorage<Record<string, Message[]>>('chat:say');
  const order = new ClientStorage<Message[]>('chat:order', version);
  const tell = new ClientStorage<Message[]>('chat:tell', version);
  const whisper = new ClientStorage<Message[]>('chat:whisper', version);

  (window as any).chat = () => ({
    tell: tell.get(),
    order: order.get(),
    whisper: whisper.get(),
  });

  when(/(?<name>\[Orden: [^\]]+\]): '(?<message>[^']+)'/, receive(order));
  when(/(?<name>\[Orden\]): '(?<message>[^']+)'/, sent(order));

  when(/(?<name>.+) te susurra '(?<message>[^']+)'/, receive(whisper));
  when(/Susurras a (?<name>.+) '(?<message>[^']+)'/, sent(whisper));

  const receiveTell = receive(tell);

  when(
    [
      /(?<name>.+) te cuenta '(?<message>[^']+)'/,
      /(?<name>.+) te responde '(?<message>[^']+)'/,
    ],
    result => {
      receiveTell(result);

      const token = 'porfa dime ';
      const { name, message } = result.groups;

      if (message.startsWith(token)) {
        write(`re ${message.substr(token.length)}`);
      }
    },
  );

  when(
    [
      /Cuentas a (?<name>.+) '(?<message>[^']+)'/,
      /Respondes a (?<name>.+) '(?<message>[^']+)'/,
    ],
    sent(tell),
  );

  when(/(?<name>\w+) te ha desafiado a un combate en la arena!/, ({ groups }) =>
    notify(`[ARENA] w/ ${groups.name}`),
  );
}

type msg = { message: string };

async function notify(content: string) {
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
