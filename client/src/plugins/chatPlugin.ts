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
  console.log(`[MESSAGE(${name})]:`, message);
  addMessage(log, { from: name, message });
  notify(name, message);
};

const sent = (log: History) => ({ groups: { name, message } }: PatternResult) =>
  addMessage(log, { to: name, message });

export function chatPlugin({ when }: PluginContext) {
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

  when(
    [
      /(?<name>.+) te cuenta '(?<message>[^']+)'/,
      /(?<name>.+) te responde '(?<message>[^']+)'/,
    ],
    receive(tell),
  );

  when(
    [
      /Cuentas a (?<name>.+) '(?<message>[^']+)'/,
      /Respondes a (?<name>.+) '(?<message>[^']+)'/,
    ],
    sent(tell),
  );
}

type msg = { message: string };

async function notify(from: string, message: string) {
  await requestNotificationPermission();

  if (!from.startsWith('[Orden')) {
    return new Notification(`${from} =>\n${message}`);
  }
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
