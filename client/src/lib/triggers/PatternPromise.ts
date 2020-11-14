import { wait } from '../util/wait';
import { PatternMatchSubscription } from './PatternMatchSubscription';
import { PatternResult } from './PatternResult';

export class PatternPromise
  extends Promise<PatternResult>
  implements PatternMatchSubscription {
  private forceReject!: (reason?: any) => void;

  constructor(
    executor: (
      resolve: (value?: PatternResult | PromiseLike<PatternResult>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    let _reject!: (reason?: any) => void;

    super((resolve, reject) => {
      _reject = reject;
      executor(resolve, reject);
    });

    this.forceReject = _reject;
  }

  timeout(seconds: number) {
    super.catch(() => {});
    wait(seconds).then(() =>
      this.forceReject(new Error(`Timeout: ${seconds}`)),
    );
    return this as Promise<PatternResult>;
  }

  wait(seconds: number) {
    return Promise.race([this, wait(seconds)]);
  }

  unsubscribe(): void {
    this.forceReject('aborted');
  }

  once() {
    return this;
  }
}
