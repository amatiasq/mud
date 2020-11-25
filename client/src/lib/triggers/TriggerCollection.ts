import { PatternMatcher } from './PatternMatcher';
import { Pattern } from './Pattern';
import { PatternOptions } from './PatternOptions';
import { PatternResult } from './PatternResult';
import { PatternSubscription } from './PatternSubscription';

export interface TriggerCollection {
  readonly list: PatternMatcher[];

  onChange(listener: (list: PatternMatcher[]) => void): () => void;

  add(pattern: Pattern, options?: PatternOptions): PatternSubscription;
  add(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions,
  ): PatternSubscription;
}
