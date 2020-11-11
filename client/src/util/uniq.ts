export function uniq<T>(list: T[]) {
  return [...new Set(list)];
}
