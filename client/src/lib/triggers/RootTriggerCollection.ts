import { emitter } from '@amatiasq/emitter';
import { ChildTriggerCollection } from './ChildTriggerCollection';
import { Pattern } from './Pattern';
import { PatternMatcher } from './PatternMatcher';
import { PatternOptions } from './PatternOptions';
import { PatternResult } from './PatternResult';
import { PatternSubscription } from './PatternSubscription';
import { TriggerCollection } from './TriggerCollection';

type Handler = (result: PatternResult) => void;

export class RootTriggerCollection implements TriggerCollection {
  private readonly children: ChildTriggerCollection[] = [];
  private readonly patterns = new Set<PatternMatcher>();
  private readonly queue: string[] = [];
  private isProcessing = false;

  private readonly emitChange = emitter<PatternMatcher[]>();
  readonly onChange = this.emitChange.subscribe;

  get list() {
    return Array.from(this.patterns);
  }

  createChild() {
    const child = new ChildTriggerCollection(this.add);
    this.children.push(child);
    return child;
  }

  add(
    pattern: Pattern,
    handler?: Handler | PatternOptions,
    options?: PatternOptions,
  ) {
    if (typeof handler !== 'function' && arguments.length === 2) {
      options = handler;
      handler = undefined;
    }

    return new PatternSubscription(match => {
      const matcher = new PatternMatcher(pattern, options);
      const subs = [matcher.onMatch(match)];
      let isAlive = true;

      const unsubscribe = () => {
        if (!isAlive) return;
        isAlive = false;
        subs.forEach(x => x());
        subs.length = 0;
        matcher.dispose();
        this.patterns.delete(matcher);
        this.emitChange(this.list);
      };

      if (typeof handler === 'function') {
        subs.push(matcher.onMatch(handler));
      } else {
        matcher.onMatch(() => setImmediate(unsubscribe));
      }

      this.patterns.add(matcher);
      this.emitChange(this.list);

      return unsubscribe;
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

      try {
        for (const pattern of this.patterns) {
          await pattern.process(line);
        }

        for (const child of this.children) {
          await child.process(line);
        }
      } catch (error) {
        console.error(
          `Line "${line}" produced error: ${
            error && error.message ? error.message : error
          }`,
        );
        throw error;
      }
    }

    this.isProcessing = false;

    if (this.queue.length) {
      return this.process(this.queue.pop()!);
    }
  }
}
