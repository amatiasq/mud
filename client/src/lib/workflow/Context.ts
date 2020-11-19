import { PluginMap } from '../../plugins/index';
import { Mud } from '../Mud';
import { PluginContext } from '../PluginContext';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { bindAll } from '../util/bindAll';
import { WorkflowFn } from './WorkflowFn';

export class Context extends PluginContext {
  private readonly children: { abort(): void }[] = [];
  private finish: ((reason: any) => void) | null = null;

  readonly plugins: PluginMap;

  constructor(
    name: string,
    username: string,
    triggers: TriggerCollection,
    plugins: PluginMap,
    private readonly mud: Mud,
  ) {
    super(name, username, triggers, mud.send);
    this.plugins = createPluginsGetter(plugins, this.log.bind(this));
    bindAll(this, Context);
  }

  register<Args extends any[]>(name: string, workflow: WorkflowFn<Args>) {
    return this.mud.workflow(name, workflow);
  }

  isRunning(workflowName: string) {
    return this.mud.isRunning(workflowName);
  }

  run(name: string, params: any[] = []) {
    this.checkNotAborted();
    this.log(`Invoke workflow "${name}" with`, ...params);

    const promise = this.mud.run(name, params, {
      logs: this.isPrintingLogs,
    });

    promise.then(
      result => this.log(`Invocation "${name}" returned `, result),
      error => this.log(`Invocation "${name}" failed `, error),
    );

    this.children.push(promise);
    return promise;
  }

  runForever() {
    this.checkNotAborted();
    return new Promise(resolve => (this.finish = resolve));
  }

  abort() {
    super.abort();

    if (this.finish) {
      this.finish(new Error('Workflow aborted'));
    }

    for (const child of this.children) {
      child.abort();
    }
  }
}

function createPluginsGetter(source: PluginMap, log: Function) {
  return new Proxy(source, {
    get(target, key: string) {
      if (!(key in target)) {
        log(`Failed to get plugin ${key}`);
        throw new Error(`Plugin ${key} is not registered.`);
      }

      log(`Requires plugin ${key}`);
      return target[key as keyof typeof target];
    },
  });
}
