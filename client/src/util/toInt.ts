export function toInt(value: string) {
  return parseInt(value.replace(/,/g, ''), 10);
}
