export function concatRegexes(...regexes: (RegExp | string)[]) {
  const join = regexes
    .map(x => x.toString().replace(/^\/|\/[gi]*$/g, ''))
    .join('');

  const flags = regexes
    .map(x => x instanceof RegExp && x.flags)
    .filter(Boolean)
    .join('');

  const uniq = [...new Set(flags)].join('');
  return new RegExp(join, uniq);
}
