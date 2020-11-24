import { Pattern } from './Pattern';
import { PatternMatchSubscription } from './PatternMatchSubscription';
import { PatternOptions } from './PatternOptions';
import { PatternPromise } from './PatternPromise';
import { PatternResult } from './PatternResult';

export interface TriggerCollection {
  add(pattern: Pattern, options?: PatternOptions): PatternPromise;
  add(
    pattern: Pattern,
    handler: (result: PatternResult) => void,
    options?: PatternOptions,
  ): PatternMatchSubscription;
}

// class ChildTriggerCollection implements TriggerCollection {
//   constructor(readonly add: TriggerCollection['add']) {}

//   process(line: string) {

//   }
// }
