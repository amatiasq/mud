import events from 'events';
import { createConnection, Socket } from 'net';

enum State {
  INIT,
  START,
  STANDBY,
}

export class Telnet extends events.EventEmitter {
  private state = State.INIT;
  private socket: Socket | null = null;

  connect({
    host = '127.0.0.1',
    port = 23,
    localAddress = '',
    socketConnectOptions = {},
    timeout = 500,
  }) {
    return new Promise<void>((resolve, reject) => {
      this.socket = createConnection(
        {
          port,
          host,
          localAddress,
          ...socketConnectOptions,
        },
        () => {
          this.state = State.START;
          this.emit('connect');
          resolve();
        },
      );

      this.socket.setTimeout(timeout, () => {
        this.emit('timeout');
        reject(new Error('timeout'));
      });

      this.socket.on('data', data => {
        this.emit('data', data);

        // if (this.state === State.START) {
        //   this.enableExtension(data, resolve);
        // }
      });

      this.socket.on('error', error => {
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('end', () => {
        this.emit('end');
        reject(new Error('Socket ends'));
      });

      this.socket.on('close', () => {
        this.emit('close');
        reject(new Error('Socket closes'));
      });
    });
  }

  send(data) {
    if (!this.socket.writable) {
      throw new Error('socket not writable');
    }

    this.socket.write(`${data}\n`);
  }

  end() {
    return new Promise<void>(resolve => {
      this.socket.end();
      resolve();
    });
  }

  destroy() {
    return new Promise<void>(resolve => {
      this.socket.destroy();
      resolve();
    });
  }

  private enableExtension(chunk, callback) {
    if (chunk[0] === 255 && chunk[1] !== 255) {
      /* info: http://tools.ietf.org/html/rfc1143#section-7
       * refuse to start performing and ack the start of performance
       * DO -> WONT WILL -> DO */
      const length = chunk.length;
      let negData = chunk;
      let cmdData = null;

      for (let i = 0; i < length; i += 3) {
        if (chunk[i] != 255) {
          negData = chunk.slice(0, i);
          cmdData = chunk.slice(i);
          break;
        }
      }

      const negResp = negData
        .toString('hex')
        .replace(/fd/g, 'fc')
        .replace(/fb/g, 'fd');

      if (this.socket.writable) {
        console.log('> NEGOTIATION', negResp);
        this.socket.write(Buffer.from(negResp, 'hex'));
        this.state = State.STANDBY;
        callback();
      }
    }
  }
}
