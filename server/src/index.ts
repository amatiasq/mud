import { createServer } from 'http';
import { Server } from 'ws';

import { DEFAULT_PORT } from '../../config.json';
import { Telnet } from './Telnet';

const port = process.env.PORT || DEFAULT_PORT;
const server = createServer();
const wss = new Server({ server });
let clients = 0;

server.listen(port, () => console.log(`Websocket server ready at ${port}`));

wss.on('connection', ws => {
  const telnet = new Telnet();
  let id = clients++;

  console.log(`CONNECTION(${id})`);

  ws.on('close', () => {
    telnet.end();
    log('Disconnected');
  });

  telnet.on('close', () => {
    log('Telnet closed');
    ws.close();
  });

  telnet.on('error', error => {
    log(`Telnet error: ${error.message}`);
    ws.close();
  });

  telnet.on('data', x => ws.send(x));

  ws.on('message', event => {
    if (event instanceof Buffer) {
      telnet.send(event);
      return;
    }

    const { type, payload } = parseJson(String(event));

    switch (type) {
      case 'OPEN':
        connect(payload);
        break;
    }
  });

  async function connect({ host, port }: { host: string; port: number }) {
    try {
      log(`Connecting to ${host}:${port}`);
      await telnet.connect({ host, port });
      log('Success');
    } catch (error) {
      log(`Can't open connection to "${host}:${port}": ${error.message}`);
    }
  }

  function log(...args: Parameters<Console['log']>) {
    console.log(`[${id}]>`, ...args);
  }
});

function parseJson(data: string) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Invalid JSON "${data}": ${error.message}`);
  }
}
