import { Pattern } from './Pattern';
import { PatternMatcher } from './PatternMatcher';
import { PatternMatchSubscription } from './PatternMatchSubscription';
import { PatternOptions } from './PatternOptions';
import { PatternPromise } from './PatternPromise';
import { PatternResult } from './PatternResult';
import { TriggerCollection } from './TriggerCollection';

type Handler = (result: PatternResult) => void;

export class RootTriggerCollection implements TriggerCollection {
  // private readonly children: ChildTriggerCollection[] = [];
  private readonly patterns = new Set<PatternMatcher>();
  private readonly queue: string[] = [];
  private isProcessing = false;

  // createChild() {
  //   const child = new ChildTriggerCollection(this.add.bind(this));
  //   this.children.push(child);
  //   return child;
  // }
  add(
    pattern: Pattern,
    handler?: Handler | PatternOptions,
    options?: PatternOptions,
  ): any {
    if (arguments.length === 1) return this.once(pattern);

    if (arguments.length === 3)
      return this.watch(pattern, handler as Handler, options);

    if (typeof handler === 'function')
      return this.watch(pattern, handler as Handler);

    return this.once(pattern, handler as PatternOptions);
  }

  private watch(pattern: Pattern, handler: Handler, options?: PatternOptions) {
    const entry = new PatternMatcher(pattern, x => handler(x), options);

    this.patterns.add(entry);

    const unsubscribe = () => this.patterns.delete(entry);

    const once = () =>
      new PatternPromise(resolve => {
        const original = handler;

        handler = async x => {
          unsubscribe();

          if (original) {
            if (options && options.await) {
              await original(x);
            } else {
              original(x);
            }
          }

          resolve(x);
        };
      });

    return { unsubscribe, once } as PatternMatchSubscription;
  }

  private once(pattern: Pattern, options?: PatternOptions) {
    return new PatternPromise(resolve => {
      const sub = this.add(pattern, handler, options);

      function handler(result: PatternResult) {
        sub.unsubscribe();
        resolve(result);
      }
    });
  }

  async process(text: string): Promise<void> {
    if (this.isProcessing) {
      this.queue.push(text);
      return;
    }

    this.isProcessing = true;

    const splitted = text.split('\n');
    const last = splitted.pop() as string;
    const lines = [...splitted.map(x => `${x}\n`), last];

    for (const line of lines) {
      // console.log('PROCESS', line);
      for (const pattern of this.patterns) {
        await pattern.process(line);
      }
    }

    this.isProcessing = false;

    if (this.queue.length) {
      return this.process(this.queue.pop()!);
    }
  }
}
