import { emitter } from '@amatiasq/emitter';
import { WorkflowContextCreator } from '../context/WorkflowContextCreator';
import { PatternMatcher } from '../triggers/PatternMatcher';
import { CancellablePromise } from '../util/CancellablePromise';
import { WorkflowFn } from './WorkflowFn';

export class Workflow<Result = any, Args extends any[] = any[]> {
  private executions = new Set<CancellablePromise<Result>>();
  private executionCount = 0;
  private _isEnabled = true;

  private readonly emitChange = emitter<this>();
  readonly onChange = this.emitChange.subscribe;

  get isRunning() {
    return Boolean(this.executions.size);
  }

  get instancesRunning() {
    return this.executions.size;
  }

  get timesExecuted() {
    return this.executionCount;
  }

  get isEnabled() {
    return this._isEnabled;
  }

  get triggers() {
    return this.contextCreator.triggerList;
  }

  constructor(
    readonly name: string,
    private readonly run: WorkflowFn<Args>,
    private readonly contextCreator: WorkflowContextCreator,
  ) {}

  onTriggersChange(listener: (list: PatternMatcher[]) => void) {
    return this.contextCreator.onTriggersChange(listener);
  }

  owns(execution: CancellablePromise<any>) {
    return this.executions.has(execution);
  }

  execute(...args: Args) {
    if (!this._isEnabled) {
      throw new Error(`Workflow "${this.name}" is disabled`);
    }

    const iteration = this.executionCount++;
    const context = this.contextCreator.createInstance(this.name);

    context.log(`[Exe(${iteration})]`, ...args);

    const promise = new CancellablePromise<Result>(
      (resolve, reject, onCancel) => {
        onCancel(() => {
          context.abort();
          reject();
        });

        Promise.resolve(this.run(context, ...args)).then(resolve, reject);
      },
    );

    this.executions.add(promise);

    const result = promise
      .then(
        result => {
          context.log(`[Res(${iteration})]`, result);
          return result;
        },
        error => {
          context.log(`[ERR(${iteration})]`, error);
          throw error;
        },
      )
      .finally(() => {
        this.executions.delete(promise);
        this.contextCreator.dispose(context);
        this.emitChange(this);
      });

    this.emitChange(this);
    return result;
  }

  stop() {
    this.executions.forEach(x => x.cancel());
    this.emitChange(this);
  }

  enable() {
    this._isEnabled = true;
    this.emitChange(this);
  }

  disable() {
    this._isEnabled = false;
    this.emitChange(this);
  }
}
