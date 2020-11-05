import { emitter } from '@amatiasq/emitter';
import { ClientSocket } from '@amatiasq/socket';

import { ClientMessage } from '../../../shared/ClientMessage';
import { ServerMessage } from '../../../shared/ServerMessage';

export class RemoteTelnet {
  private _isConnected = false;

  get isConnected() {
    return this._isConnected;
  }

  private readonly emitConnected = emitter();
  readonly onConnected = this.emitConnected.subscribe;

  private readonly emitClose = emitter();
  readonly onClose = this.emitClose.subscribe;

  private readonly emitData = emitter<string>();
  readonly onData = this.emitData.subscribe;

  constructor(
    private readonly socket: ClientSocket<ClientMessage, ServerMessage>,
  ) {
    socket.onMessageType('CONNECTED', this.emitConnected);
    socket.onMessageType('DISCONNECTED', this.emitClose);
    socket.onMessageType('OUTPUT', this.emitData);

    this.onConnected(() => (this._isConnected = true));
    this.onClose(() => (this._isConnected = false));
  }

  connect(options: { host: string; port: number }) {
    this.socket.send('OPEN', options);
  }

  send(value: string) {
    this.socket.send('INPUT', value);
  }

  close() {
    this.socket.close();
  }
}
