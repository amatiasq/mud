import { wait } from '../util/wait';
import { PatternResult } from './PatternResult';

export class PatternSubscription {
  private readonly stop: () => void;
  readonly then: Promise<PatternResult>['then'];

  constructor(
    executor: (match: (result: PatternResult) => void) => () => void,
  ) {
    let resolve!: (value: PatternResult) => void;
    const promise = new Promise<PatternResult>(
      _resolve => (resolve = _resolve),
    );

    this.stop = executor(resolve);
    this.then = promise.then.bind(promise);
  }

  timeout(seconds: number) {
    return Promise.race([
      this,
      wait(seconds).then(() => {
        this.stop();
        throw new Error(`Timeout: ${seconds}`);
      }),
    ]);
  }

  wait(seconds: number) {
    return Promise.race([this, wait(seconds).then(() => this.stop())]);
  }

  unsubscribe(): void {
    return this.stop();
  }
}
