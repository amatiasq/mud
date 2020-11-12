import { SinglePattern } from './Pattern';

export class PatternResult {
  private get regexes() {
    return this.patterns.filter(isRegex);
  }

  private get stringPatterns() {
    return this.patterns.filter(x => !isRegex(x)) as string[];
  }

  get fullMatch() {
    return this.stringPatterns[0];
  }

  get captured() {
    const regexMatches = this.regexes
      .map(x => this.haystack.match(x)!)
      .filter(Boolean)
      .map(x => Array.from(x));

    // TODO: maybe return the one with more captures?
    return regexMatches[0];
  }

  get groups(): Record<string, string> {
    return this.regexes
      .map(x => this.haystack.match(x)!)
      .filter(Boolean)
      .map(x => x.groups!)
      .filter(Boolean)
      .reduce(merge, {});
  }

  constructor(
    readonly patterns: SinglePattern[],
    private readonly haystack: string,
  ) {}
}

function isRegex(value: SinglePattern) {
  return value instanceof RegExp;
}

function merge(a: object, b: object) {
  return { ...a, ...b };
}
