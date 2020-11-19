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
    this.socket.send(encode(value));
  }

  close() {
    this.socket.close();
  }

  private proxy(type: string, payload: any) {
    this.socket.send(JSON.stringify({ type, payload }));
  }

  private async onMessage(event: MessageEvent<Blob>) {
    const reader = new FileReader();
    reader.onloadend = x => this.emitData(reader.result as string);
    reader.readAsText(event.data, 'ISO-8859-1');

    // .replace(/z<Ex>/g, '')
    // .replace(/\[1z<\/Ex>/g, '')
    // .replace(/&lt;/g, '<')
    // .replace(/&gt;/g, '>')
    // .replace(/&amp;/g, '&');
  }
}

function encode(text: string) {
  const encoder = new TextEncoder();
  const invariant = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return encoder.encode(invariant);
}
