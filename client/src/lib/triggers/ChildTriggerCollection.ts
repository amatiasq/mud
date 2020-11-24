import { emitter } from '@amatiasq/emitter';
import { PatternMatcher } from './PatternMatcher';
import { TriggerCollection } from './TriggerCollection';

export class ChildTriggerCollection implements TriggerCollection {
  private readonly patterns = new Set<PatternMatcher>();

  private readonly emitChange = emitter<PatternMatcher[]>();
  readonly onChange = this.emitChange.subscribe;

  constructor(readonly add: TriggerCollection['add']) {}

  async process(line: string) {
    for (const pattern of this.patterns) {
      await pattern.process(line);
    }
  }
}
