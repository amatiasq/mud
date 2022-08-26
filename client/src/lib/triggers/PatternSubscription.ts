import { CancellablePromise } from '../util/CancellablePromise';
import { wait } from '../util/wait';
import { PatternResult } from './PatternResult';

export class PatternSubscription {
  private readonly stop: () => void;
  readonly then: CancellablePromise<PatternResult>['then'];

  constructor(
    executor: (match: (result: PatternResult) => void) => () => void,
  ) {
    let resolve!: (value: PatternResult) => void;
    const promise = new CancellablePromise<PatternResult>(
      _resolve => (resolve = _resolve),
    );

    promise.onCancel(() => this.stop());

    this.stop = executor(resolve);
    this.then = promise.then.bind(promise);
  }

  timeout(seconds: number) {
    return CancellablePromise.race([
      this.then(),
      wait(seconds).then(() => {
        this.stop();
        throw new Error(`Timeout: ${seconds}`);
      }),
    ]);
  }

  wait(seconds: number) {
    return CancellablePromise.race<PatternResult | void>([
      this.then(),
      wait(seconds).then(() => this.stop()),
    ]);
  }

  unsubscribe(): void {
    return this.stop();
  }
}
