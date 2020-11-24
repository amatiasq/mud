import { emitter } from '@amatiasq/emitter';

import { Mud } from '../Mud';
import { Pattern } from '../triggers/Pattern';
import { PatternMatcher } from '../triggers/PatternMatcher';
import { PatternOptions } from '../triggers/PatternOptions';
import { PatternResult } from '../triggers/PatternResult';
import { PatternSubscription } from '../triggers/PatternSubscription';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { wait } from '../util/wait';
import { WriteOptions } from '../WriteOptions';

export type BasicContext = ReturnType<BasicContextCreator['createInstance']>;

export class BasicContextCreator {
  private readonly dispositions = new Map<
    BasicContext,
    (data: void) => boolean
  >();

  private readonly emitInstanceAborted = emitter<BasicContext>();
  readonly onInstanceAborted = this.emitInstanceAborted.subscribe;

  private readonly emitInstanceDisposed = emitter<BasicContext>();
  readonly onInstanceDisposed = this.emitInstanceDisposed.subscribe;

  constructor(
    private readonly triggers: TriggerCollection,
    private readonly send: Mud['send'],
  ) {}

  onTriggersChange(listener: (list: PatternMatcher[]) => void) {
    return this.triggers.onChange(listener);
  }

  createInstance(name: string) {
    const { checkNotAborted, send, triggers } = this;
    const dispose = emitter<void>();
    const subscriptions: PatternSubscription[] = [];
    let isPrintingLogs = false;
    let isAborted = false;

    const context = {
      get name() {
        return name;
      },
      get isAborted() {
        return isAborted;
      },
      get isPrintingLogs() {
        return isPrintingLogs;
      },
      get printLogs() {
        return (isPrintingLogs = true);
      },

      onDispose: dispose.subscribe,
      send,
      log,
      when,

      sleep: (seconds: number) => {
        checkNotAborted(context);
        log('[SLEEP]', seconds);
        return wait(seconds);
      },

      abort: () => {
        if (isAborted) return;
        isAborted = true;
        this.emitInstanceAborted(context);
      },

      write: (command: string, options?: WriteOptions) => {
        checkNotAborted(context);
        log(`[WRITE]`, command);
        send(command, options);
      },
    };

    dispose.subscribe(() => subscriptions.forEach(x => x.unsubscribe()));
    this.dispositions.set(context, dispose);
    return context;

    function log(...args: Parameters<Console['log']>) {
      checkNotAborted(context);

      if (isPrintingLogs) {
        console.log(`[${name}]`, ...args);
      }
    }

    function when(
      pattern: Pattern,
      options?: PatternOptions,
    ): PatternSubscription;
    function when(
      pattern: Pattern,
      handler: (result: PatternResult) => void,
      options?: PatternOptions,
    ): PatternSubscription;
    function when(
      pattern: Pattern,
      handler?: ((result: PatternResult) => void) | PatternOptions,
      options?: PatternOptions,
    ) {
      checkNotAborted(context);
      log('[WATCH]', pattern, options);

      const onResult = isPrintingLogs
        ? ({ patterns, ...rest }: PatternResult) =>
            log('[TRIGGERED]', ...patterns, rest)
        : null;

      if (typeof handler === 'function') {
        if (onResult) {
          const original = handler;
          handler = result => {
            onResult(result);
            original(result);
          };
        }

        const subscription = triggers.add(pattern, handler, options);
        subscriptions.push(subscription);
        return subscription;
      }

      options = handler;
      const promise = triggers.add(pattern, options);

      if (onResult) {
        promise.then(onResult);
      }

      subscriptions.push(promise);
      return promise;
    }
  }

  dispose(context: BasicContext) {
    const dispose = this.dispositions.get(context);

    if (!dispose) {
      throw new Error(`Can't dispose context: ${context.name}`);
    }

    this.dispositions.delete(context);
    dispose();
    this.emitInstanceDisposed(context);
  }

  protected checkNotAborted(context: BasicContext) {
    if (context.isAborted) {
      throw new Error(`[${context.name}] Workflow aborted.`);
    }
  }
}
