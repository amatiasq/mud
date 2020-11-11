import { Context } from './Context';

export type WorkflowFn<Args extends any[]> = (
  context: Context,
  ...args: Args
) => Promise<any> | void;
