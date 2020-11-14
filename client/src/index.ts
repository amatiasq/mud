import { emitter } from '@amatiasq/emitter';

import { Mud } from './lib/Mud';
import { RemoteTelnet } from './lib/RemoteTelnet';
import { registerWorkflows } from './registerWorkflows';
import { renderUserInterface } from './ui';
import { getPassword } from './util/getPassword';
import { getQueryParams } from './util/getQueryParams';
import { DEFAULT_PORT } from '../../config.json';

let FORCE_PROD_SERVER = false;
// FORCE_PROD_SERVER = true;

const serverUri = getSocketUri();
const { host, port, user, pass } = getParams();
const { terminal, controls } = renderUserInterface(document.body);

openSocket();

window.addEventListener('unhandledrejection', event => {
  const error = event.reason as Error;

  if (error.message.startsWith('Timeout: ')) {
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
    runWorkflow(workflow, args);
  });

  mud.registerHandler('#', command => {
    const [trigger, action, permanent] = command.split(/#/).map(x => x.trim());
    const name = `#${trigger}#`;
    const run = () => onUserInput(action);

    if (permanent != null) {
      mud.daemon(name, ({ when, printLogs }) => when(trigger, run));
    } else {
      mud.runOnce(name, ({ when, printLogs }) => when(trigger).then(run));
    }

    terminal.write(`WHEN: ${trigger}\nRUN: ${action}\n`);
  });

  await mud.login(user, pass);
  registerWorkflows(mud);
  await connectStats();
  connectButtons();

  Object.assign(window, { mud });

  function onUserInput(command: string) {
    terminal.write(`${command}\n`);

    if (mud.userInput(command)) {
      telnet.send(command);
    }
  }

  async function connectStats() {
    const hp = emitter<number>();
    controls.addMeter('red', hp.subscribe);

    const mana = emitter<number>();
    controls.addMeter('blue', mana.subscribe);

    const mv = emitter<number>();
    controls.addMeter('green', mv.subscribe);

    mud.getPlugin('prompt').onUpdate(x => {
      hp(x.hp.percent);
      mana(x.mana.percent);
      mv(x.mv.percent);
    });
  }

  function connectButtons() {
    controls.addButton('Entrenar', () => mud.run('train'));
  }

  function runWorkflow(name: string, args: string[]) {
    const cmd = `"${name}" with "${args.join(' ')}"`;
    terminal.write(`-> Running ${cmd}\n`);

    mud.run(name, args).then(
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
  const [host, port] = server.split(':');
  const pass = getPassword(user);
  return { host, port: parseInt(port, 10), user, pass };
}
