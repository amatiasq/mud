import { createServer } from 'http';
import Telnet from 'telnet-client';

import { MessageData, WebSocketServer } from '@amatiasq/socket';

import { ClientMessage } from '../../shared/ClientMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { ServerMessage } from '../../shared/ServerMessage';

const port = process.env.PORT || DEFAULT_PORT;
const server = createServer();
const wss = new WebSocketServer<ServerMessage, ClientMessage>(server);

server.listen(port, () => console.log(`Websocket server ready at ${port}`));

wss.onConnection(ws => {
  const telnet = new Telnet();

  let isConnected = true;

  ws.onDestroy(() => {
    isConnected = false;
    telnet.end();
    console.log('DISCONNECTED');
  });

  console.log('CONNECTION');

  telnet.on('close', () => send('DISCONNECTED', undefined));
  telnet.on('data', buffer => send('OUTPUT', buffer.toString()));

  telnet.on('error', () => {
    telnet.end();
    send('DISCONNECTED', undefined);
  });

  ws.onMessageType('OPEN', async ({ host, port }) => {
    try {
      console.log(`Connecting to ${host}:${port}`);
      await telnet.connect({ host: host, port });
      console.log('Success');
      send('CONNECTED', undefined);
    } catch (error) {
      send(
        'ERROR',
        `Can't open connection to "${host}:${port}": ${error.message}`,
      );
    }
  });

  ws.onMessageType('INPUT', value => telnet.send(value));

  function send<T extends ServerMessage['type']>(
    type: T,
    data: MessageData<ServerMessage, T>,
  ) {
    if (isConnected) {
      ws.send(type, data);
    }
  }
});
