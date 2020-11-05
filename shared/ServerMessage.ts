export interface Message<Type extends string | number, Data = void> {
  type: Type;
  data: Data;
}

export type ServerMessage =
  | Message<'ERROR', string>
  | Message<'OUTPUT', string>
  | Message<'CONNECTED'>
  | Message<'DISCONNECTED'>;
