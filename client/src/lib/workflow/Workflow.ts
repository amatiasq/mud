import { CancellablePromise } from '../util/CancellablePromise';
import { Context } from './Context';
import { WorkflowFn } from './WorkflowFn';

export class Workflow<Result = any, Args extends any[] = any[]> {
  private executionCount = 0;
  private executions = new Set<CancellablePromise<Result>>();

  get isRunning() {
    return Boolean(this.executions.size);
  }

  get instancesRunning() {
    return this.executions.size;
  }

  get timesExecuted() {
    return this.executionCount;
  }

  constructor(readonly name: string, private readonly run: WorkflowFn<Args>) {}

  owns(execution: CancellablePromise<any>) {
    return this.executions.has(execution);
  }

  execute(context: Context, ...args: Args) {
    const iteration = this.executionCount++;

    context.log(`[Exe(${iteration})]`, ...args);

    const promise = new CancellablePromise<Result>(
      (resolve, reject, onCancel) => {
        onCancel(() => context.abort());
        Promise.resolve(this.run(context, ...args)).then(resolve, reject);
      },
    );

    promise.then(
      result => {
        context.log(`[Res(${iteration})]`, result);
        return result;
      },
      error => {
        context.log(`[ERR(${iteration})]`, error);
        throw error;
      },
    );

    this.executions.add(promise);
    promise.finally(() => this.executions.delete(promise));

    return promise;
  }
}
