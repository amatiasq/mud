import { trimEnd } from '../util/trimEnd';
import { Pattern, SinglePattern } from './Pattern';
import { PatternOptions } from './PatternOptions';
import { PatternResult } from './PatternResult';

export class PatternMatcher {
  private readonly patterns: SinglePattern[];
  private readonly buffer;
  readonly length;

  constructor(
    pattern: Pattern,
    private readonly handler: (result: PatternResult) => void,
    private readonly options: PatternOptions = {},
  ) {
    this.patterns = Array.isArray(pattern) ? pattern : [pattern];
    this.length =
      options.captureLength ||
      Math.max(...this.patterns.map(x => String(x).length)) * 10;

    this.buffer = buffer(this.length);
  }

  process(text: string) {
    const value = this.buffer(text);
    const matching = this.patterns.filter(pattern =>
      this.testPattern(value, pattern),
    );

    if (!matching.length) {
      return;
    }

    this.buffer.clear();
    const result = new PatternResult(matching, value);
    const output = this.handler(result);
    return this.options.await ? output : null;
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
