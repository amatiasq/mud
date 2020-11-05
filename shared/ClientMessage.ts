export interface Message<Type extends string | number, Data = void> {
  type: Type;
  data: Data;
}

export type ClientMessage =
  | Message<'ERROR', string>
  | Message<'OPEN', { host: string; port: number }>
  | Message<'INPUT', string>;
