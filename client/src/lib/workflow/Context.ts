import { WorkflowFn } from './WorkflowFn';
import { PluginMap } from '../../plugins/index';
import { Mud } from '../Mud';
import { PluginContext } from '../PluginContext';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { bindAll } from '../util/bindAll';
import { WriteOptions } from '../WriteOptions';

export class Context extends PluginContext {
  private finish: ((reason: any) => void) | null = null;

  readonly plugins: PluginMap;

  constructor(
    name: string,
    username: string,
    triggers: TriggerCollection,
    plugins: PluginMap,
    send: (command: string, options?: WriteOptions) => void,
    readonly register: <Args extends any[]>(
      name: string,
      action: WorkflowFn<Args>,
    ) => void,
    private readonly runWorkflow: Mud['run'],
  ) {
    super(name, username, triggers, send);
    this.plugins = createPluginsGetter(plugins, this.log.bind(this));

    bindAll(this, Context);
  }

  run(name: string, params: any[] = []) {
    this.checkNotAborted();
    this.log(`Invoke workflow "${name}" with`, ...params);

    const promise = this.runWorkflow(name, params, {
      logs: this.isPrintingLogs,
    });

    promise.then(
      result => this.log(`Invocation "${name}" returned `, result),
      error => this.log(`Invocation "${name}" failed `, error),
    );

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
