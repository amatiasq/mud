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
    if (arguments.length === 2 && typeof handler !== 'function') {
      options = handler;
      handler = undefined;
    }

    return new PatternSubscription(match => {
      const matcher = new PatternMatcher(pattern, options);

      matcher.onMatch(match);

      if (typeof handler === 'function') {
        matcher.onMatch(handler);
      }

      this.patterns.add(matcher);
      this.emitChange([...this.patterns]);

      return () => {
        this.patterns.delete(matcher);
        this.emitChange([...this.patterns]);
      };
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

      for (const child of this.children) {
        await child.process(line);
      }
    }

    this.isProcessing = false;

    if (this.queue.length) {
      return this.process(this.queue.pop()!);
    }
  }
}
