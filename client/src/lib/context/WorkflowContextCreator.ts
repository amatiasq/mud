import { BindedPluginMap, PluginMap } from '../../plugins';
import { Mud } from '../Mud';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { CancellablePromise } from '../util/CancellablePromise';
import { BasicContext, BasicContextCreator } from './BasicContextCreator';

export type WorkflowContext = ReturnType<
  WorkflowContextCreator['createInstance']
>;

export class WorkflowContextCreator extends BasicContextCreator {
  private readonly register: Mud['workflow'];
  private readonly getWorkflow: Mud['getWorkflow'];

  constructor(
    mud: Mud,
    triggers: TriggerCollection,
    private readonly plugins: PluginMap,
  ) {
    super(triggers, mud.send.bind(mud));
    this.register = mud.workflow.bind(mud);
    this.getWorkflow = mud.getWorkflow.bind(mud);
  }

  createInstance(name: string) {
    const context = super.createInstance(name);
    const { log, abort } = context;
    const { checkNotAborted, register, getWorkflow } = this;

    const children: CancellablePromise<any>[] = [];
    let finish: (value: string) => void;

    return Object.assign(context, {
      plugins: pluginsGetter(this.plugins, context),

      register,

      isRunning: (name: string) => getWorkflow(name).isRunning,

      run(name: string, ...params: any[]) {
        checkNotAborted(context);
        log(`Invoke workflow "${name}" with`, ...params);

        const workflow = getWorkflow(name);
        const execution = workflow.execute(...params);

        children.push(execution);

        execution.then(
          result => log(`Invocation "${name}" returned `, result),
          error => log(`Invocation "${name}" failed `, error),
        );

        return execution;
      },

      runForever() {
        checkNotAborted(context);
        return new Promise(resolve => (finish = resolve));
      },

      abort(fromExecution?: boolean) {
        if (context.isAborted) return;

        children.forEach(x => x.cancel());

        abort();

        if (finish) {
          finish(
            `Workflow aborted from ${fromExecution ? 'execution' : 'context'}`,
          );
        }
      },
    });

    // const createChild = (childName?: string) => {
    //   const child = this.createInstance(
    //     `${name}->${childName || children.length}`,
    //   );

    //   if (context.isPrintingLogs) {
    //     child.printLogs;
    //   }

    //   return child;
    // };
  }
}

function pluginsGetter(
  source: PluginMap,
  context: BasicContext,
): BindedPluginMap {
  return new Proxy(source as any, {
    get(target: PluginMap, key: string) {
      if (!(key in target)) {
        context.log(`Failed to get plugin ${key}`);
        throw new Error(`Plugin ${key} is not registered.`);
      }

      context.log(`Requires plugin ${key}`);
      // TODO: bind plugin to context
      return target[key as keyof typeof target](context);
    },
  });
}
