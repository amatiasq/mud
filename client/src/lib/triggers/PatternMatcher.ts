import { emitter } from '@amatiasq/emitter';
import { trimEnd } from '../util/trimEnd';
import { Pattern, SinglePattern } from './Pattern';
import { PatternOptions } from './PatternOptions';
import { PatternResult } from './PatternResult';

export class PatternMatcher {
  private readonly buffer;
  readonly patterns: SinglePattern[];
  readonly length;
  private _isEnabled = true;

  get isEnabled() {
    return this._isEnabled;
  }

  private readonly emitMatch = emitter<PatternResult>();
  readonly onMatch = this.emitMatch.subscribe;

  constructor(pattern: Pattern, private readonly options: PatternOptions = {}) {
    this.patterns = Array.isArray(pattern) ? pattern : [pattern];
    this.length =
      options.captureLength ||
      Math.max(...this.patterns.map(x => String(x).length)) * 10;

    this.buffer = buffer(this.length);
  }

  enable() {
    this._isEnabled = true;
  }

  disable() {
    this._isEnabled = false;
    this.buffer.clear();
  }

  process(text: string) {
    if (!this._isEnabled) return;

    const value = this.buffer(text);
    const matching = this.patterns.filter(pattern =>
      this.testPattern(value, pattern),
    );

    if (!matching.length) return;

    this.buffer.clear();
    const result = new PatternResult(matching, value);

    const { logger } = this.options as any;
    const { blockProcessingUntil } = this.options;

    if (logger) {
      logger();
    }

    this.emitMatch(result);

    if (blockProcessingUntil) {
      return blockProcessingUntil();
    }
  }

  dispose() {
    this.buffer.clear();
    Object.assign(this, {
      buffer: null,
      patterns: null,
      emitMatch: null,
      onMatch: null,
      options: null,
    });
  }

  private testPattern(text: string, pattern: SinglePattern) {
    if (typeof pattern === 'string') {
      return text.indexOf(pattern) > -1;
    }

    return pattern.test(text);
  }
}

function buffer(length: number) {
  let value = '';
  const clear = () => (value = '');
  const add = (text: string) => (value = trimEnd(`${value}${text}`, length));
  return Object.assign(add, { clear });
}
