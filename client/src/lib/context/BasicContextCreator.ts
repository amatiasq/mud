import { emitter } from '@amatiasq/emitter';

import { Mud } from '../Mud';
import { Pattern } from '../triggers/Pattern';
import { PatternMatcher } from '../triggers/PatternMatcher';
import { PatternOptions } from '../triggers/PatternOptions';
import { PatternResult } from '../triggers/PatternResult';
import { PatternSubscription } from '../triggers/PatternSubscription';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { CancellablePromise } from '../util/CancellablePromise';
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

  get triggerList() {
    return this.triggers.list;
  }

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
      when: Object.assign(when, { any: whenAny }),

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

    async function whenAny(
      ...watchers: (PatternSubscription | CancellablePromise<any>)[]
    ) {
      const result = await Promise.any(watchers);
      watchers.forEach(x =>
        x instanceof CancellablePromise ? x.cancel() : x.unsubscribe(),
      );
      return result;
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

      if (typeof handler !== 'function' && arguments.length > 1) {
        options = handler;
        handler = undefined;
      }

      if (isPrintingLogs) {
        if (options && (options as any).logger) {
          throw new Error('run after not supported');
        }

        options = Object.assign(
          {
            logger: [
              ({ patterns, ...rest }: PatternResult) =>
                log('[TRIG GERED]', ...patterns, rest),
            ],
          },
          options,
        );
      }

      const subscription =
        typeof handler === 'function'
          ? triggers.add(pattern, handler, options)
          : triggers.add(pattern, options);

      subscriptions.push(subscription);
      return subscription;
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
