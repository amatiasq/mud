import { BasicContext } from '../lib/context/BasicContextCreator';

export function createPlugin<T, U>(
  initiator: (context: BasicContext) => T,
  instanceCreator: (utils: T) => (context: BasicContext) => U,
) {
  return (context: BasicContext) => instanceCreator(initiator(context));
}
