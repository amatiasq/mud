import { ExecutionAbortedError } from './ExecutionAbortedError';
import { Pattern } from './triggers/Pattern';
import { PatternMatchSubscription } from './triggers/PatternMatchSubscription';
import { PatternOptions } from './triggers/PatternOptions';
import { PatternPromise } from './triggers/PatternPromise';
import { PatternResult } from './triggers/PatternResult';
import { TriggerCollection } from './triggers/TriggerCollection';
import { bindAll } from './util/bindAll';
import { wait } from './util/wait';
import { WriteOptions } from './WriteOptions';

export class PluginContext {
  protected readonly subscriptions: PatternMatchSubscription[] = [];
  protected isPrintingLogs = false;
  private isAborted = false;

  get printLogs() {
    this.isPrintingLogs = true;
    return null;
  }

  constructor(
    readonly name: string,
    readonly username: string,
    protected readonly triggers: TriggerCollection,
    protected readonly send: (command: string, options?: WriteOptions) => void,
  ) {
    bindAll(this, PluginContext);
  }

  write(command: string, options?: WriteOptions) {
    this.checkNotAborted();
    this.log(`[WRITE]`, command);
    this.send(command, options);
  }

  when(pattern: Pattern, options?: PatternOptions): PatternPromise;
  when(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions,
  ): PatternMatchSubscription;
  when(
    pattern: Pattern,
    handler?: ((result: PatternResult) => void) | PatternOptions,
    options?: PatternOptions,
  ) {
    this.checkNotAborted();
    this.log('[WATCH]', pattern);

    if (typeof handler === 'function') {
      return this.triggers.add(pattern, handler, options);
    } else {
      return this.triggers.add(pattern, handler);
    }
  }

  sleep(seconds: number) {
    this.checkNotAborted();
    this.log('[SLEEP]', seconds);
    return wait(seconds);
  }

  abort() {
    this.isAborted = true;
  }

  dispose() {
    this.log('DISPOSE');
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  log(...args: Parameters<Console['log']>) {
    this.checkNotAborted();

    if (this.isPrintingLogs) {
      console.log(`[${this.name}]`, ...args);
    }
  }

  protected checkNotAborted() {
    if (this.isAborted) {
      throw new ExecutionAbortedError();
    }
  }
}
