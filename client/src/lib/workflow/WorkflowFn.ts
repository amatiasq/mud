import { WorkflowContext } from '../context/WorkflowContextCreator';
import { PatternSubscription } from '../triggers/PatternSubscription';

export type WorkflowFn<Args extends any[]> = (
  context: WorkflowContext,
  ...args: Args
) => Promise<any> | PatternSubscription | void;
