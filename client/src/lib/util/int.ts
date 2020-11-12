import { concatRegexesUnescaped } from './concatRegexes';

const NUMBER = /-?\d+(?:,\d{3})*/;

export function toInt(value: string) {
  return parseInt(value.replace(/,/g, ''), 10);
}

export function int(name?: string) {
  return name ? concatRegexesUnescaped(`(?<${name}>`, NUMBER, ')') : NUMBER;
}
