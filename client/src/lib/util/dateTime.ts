const pad = (val: number) => (val < 10 ? `0${val}` : val);

export type DateTime = '[string DateTime]';

export function datetime(date: Date) {
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}` as DateTime;
}
