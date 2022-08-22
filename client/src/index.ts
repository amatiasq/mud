import { DEFAULT_PORT } from '../../config.json';
import { Mud } from './lib/Mud';
import { RemoteTelnet } from './lib/RemoteTelnet';
import { registerWorkflows } from './registerWorkflows';
import { bindViewTo } from './state';
import { renderUserInterface } from './ui';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';

let FORCE_PROD_SERVER = false;
// FORCE_PROD_SERVER = true;

const serverUri = getSocketUri();
const { host, port, user, pass } = getParams();
const terminal = renderUserInterface(document.body);

openSocket();

window.addEventListener('unhandledrejection', event => {
  const error = event.reason as Error;

  if ((error as any) === 'aborted') {
    event.preventDefault();
  }

  if (error && error.message && error.message.startsWith('Timeout: ')) {
    event.preventDefault();
    console.warn(error.message);
  }
});

function openSocket() {
  const socket = new WebSocket(serverUri);

  // socket.addEventListener('close', openSocket);
  socket.addEventListener('open', () => {
    const telnet = new RemoteTelnet(socket);

    telnet.connect(host, port);
    terminal.write(`Connecting to ${host}:${port} as ${user}\n`);

    initializeMud(telnet);
  });
}

async function initializeMud(telnet: RemoteTelnet) {
  const mud = new Mud(telnet);

  mud.onCommand(x => terminal.write(`${x}\n`));
  telnet.onData(data => terminal.write(data));
  terminal.onSubmit(onUserInput);

  window.onbeforeunload = () => {
    if (telnet.isConnected) {
      telnet.send('abandonar');
    }

    telnet.close();
  };

  mud.registerHandler('!', command => {
    const [workflow, ...args] = command.split(/\s+/);

    if (workflow === 'stop') {
      mud.stopAll();
    } else {
      runWorkflow(workflow, args);
    }
  });

  mud.registerHandler('#', command => {
    const [trigger, action, permanent] = command.split(/#/).map(x => x.trim());
    const name = `#${trigger}${permanent}`;
    const run = () => onUserInput(action);

    if (permanent != null) {
      mud.daemon(name, ({ when, printLogs }) => when(trigger, run));
    } else {
      mud.runOnce(name, ({ when, printLogs }) => when(trigger).then(run));
    }

    terminal.write(`WHEN: ${trigger}\nRUN: ${action}\n`);
  });

  await mud.login(user, pass);

  bindViewTo(mud);

  // if (user === 'may') {
  registerWorkflows(mud);
  // }

  Object.assign(window, { mud });

  function onUserInput(command: string) {
    terminal.write(`${command}\n`);

    if (mud.userInput(command)) {
      telnet.send(command);
    }
  }

  function runWorkflow(name: string, args: string[]) {
    const cmd = `"${name}" with "${args.join(' ')}"`;
    terminal.write(`-> Running ${cmd}\n`);

    mud
      .getWorkflow(name)
      .execute(...args)
      .then(
        x => terminal.write(`\n<- Done ${cmd}: ${x}\n`),
        x => terminal.write(`\n\n<! FAILED ${cmd}: ${x.message}\n\n`),
      );
  }
}

function getSocketUri() {
  return location.origin === 'https://amatiasq.github.io' || FORCE_PROD_SERVER
    ? 'wss://mudOS.amatiasq.com'
    : `ws://localhost:${DEFAULT_PORT}`;
}

function getParams() {
  const { user, server } = getQueryParams();
  const [host, port] = (server || 'mud.balzhur.org:5400').split(':');
  const pass = getPassword(user);
  return { host, port: parseInt(port, 10), user, pass };
}
