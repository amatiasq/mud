const createConcatenator = (escape: (x: string) => string) => (
  ...regexes: (RegExp | string)[]
) => {
  const join = regexes
    .map(x => (x instanceof RegExp ? regexToString(x) : escape(x)))
    .join('');

  const flags = regexes
    .map(x => x instanceof RegExp && x.flags)
    .filter(Boolean)
    .join('');

  const uniq = [...new Set(flags)].join('');
  return new RegExp(join, uniq);
};

export const concatRegexes = createConcatenator(escapeRegExp);
export const concatRegexesUnescaped = createConcatenator(String);

function regexToString(value: RegExp) {
  return value.toString().replace(/^\/|\/[gi]*$/g, '');
}

function stringToRegex(value: string, flags: string) {
  return new RegExp(escapeRegExp(value));
}

function escapeRegExp(value: string) {
  // $& means the whole matched string
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\n/g, '\\n');
}
