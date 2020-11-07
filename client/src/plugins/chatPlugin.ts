import { ClientStorage } from '@amatiasq/client-storage';

import { PluginContext } from '../lib/PluginContext';
import { PatternResult } from '../lib/triggers/PatternResult';
import { requestNotificationPermission } from '../lib/util/requestNotificationPermission';

interface Message {
  time: number;
  from: string;
  to: string;
  message: string;
}

type History = ClientStorage<Record<string, Message[]>>;

export function chatPlugin({ when }: PluginContext) {
  // const say = new ClientStorage<Record<string, Message[]>>('chat:say');
  const tell = new ClientStorage<Record<string, Message[]>>('chat:tell');
  const whisper = new ClientStorage<Record<string, Message[]>>('chat:whisper');

  (window as any).chat = () => tell.get();

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

function receive(log: History) {
  return ({ groups: { name, message } }: PatternResult) => {
    console.log(`[MESSAGE(${name})]:`, message);
    addMessage(log, { from: name, message });
    notify(name, message);
  };
}

function sent(log: History) {
  return ({ groups: { name, message } }: PatternResult) =>
    addMessage(log, { to: name, message });
}

async function notify(from: string, message: string) {
  await requestNotificationPermission();
  return new Notification(`${name} te cuenta '${message}'`);
}

function addMessage(log: History, partial: { from: string } & msg): Message;
function addMessage(log: History, partial: { to: string } & msg): Message;
function addMessage(
  log: History,
  partial: { from?: string; to?: string } & msg,
): Message {
  const message: Message = {
    time: Date.now(),
    from: 'me',
    to: 'me',
    ...partial,
  };

  const data = log.get() || {};
  const other = (partial.from || partial.to)!;
  const history = data[other] || [];

  history.push(message);
  log.set({ ...data, [other]: history });
  return message;
}
