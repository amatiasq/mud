import { emitter } from '@amatiasq/emitter';

export class RemoteTelnet {
  private _isConnected = false;

  get isConnected() {
    return this._isConnected;
  }

  private readonly emitClose = emitter();
  readonly onClose = this.emitClose.subscribe;

  private readonly emitData = emitter<string>();
  readonly onData = this.emitData.subscribe;

  constructor(private readonly socket: WebSocket) {
    socket.addEventListener('close', this.emitClose);
    socket.addEventListener('message', this.onMessage.bind(this));

    this.onData(() => (this._isConnected = true));
    this.onClose(() => (this._isConnected = false));
  }

  connect(host: string, port: number) {
    this.proxy('OPEN', { host, port });
  }

  send(value: string) {
    this.proxy('INPUT', value);
  }

  close() {
    this.socket.close();
  }

  private proxy(type: string, payload: any) {
    this.socket.send(JSON.stringify({ type, payload }));
  }

  private async onMessage(event: MessageEvent<Blob>) {
    const escaped = await event.data.text();
    const text = escaped
      // .replace(/z<Ex>/g, '')
      // .replace(/\[1z<\/Ex>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    this.emitData(text);
  }
}
