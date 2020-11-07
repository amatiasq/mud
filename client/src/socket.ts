import { ClientSocket } from '@amatiasq/socket';

import { ClientMessage } from '../../shared/ClientMessage';
import { DEFAULT_PORT } from '../../shared/config.json';
import { ServerMessage } from '../../shared/ServerMessage';

let FORCE_PROD_SERVER = false;
// FORCE_PROD_SERVER = true;

const serverUri =
  location.origin === 'https://amatiasq.github.io' || FORCE_PROD_SERVER
    ? 'wss://mudOS.amatiasq.com'
    : `ws://localhost:${DEFAULT_PORT}`;

export const socket = new ClientSocket<ClientMessage, ServerMessage>(serverUri);

socket.onMessage(x => console.debug('MESSAGE', x));
