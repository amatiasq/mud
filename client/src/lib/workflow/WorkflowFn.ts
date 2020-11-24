import { WorkflowContext } from '../context/WorkflowContextCreator';
import { PatternMatchSubscription } from '../triggers/PatternMatchSubscription';

export type WorkflowFn<Args extends any[]> = (
  context: WorkflowContext,
  ...args: Args
) => Promise<any> | PatternMatchSubscription | void;
