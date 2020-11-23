import { PluginMap } from '../../plugins/index';
import { Mud } from '../Mud';
import { PluginContext } from '../PluginContext';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { bindAll } from '../util/bindAll';

export class Context extends PluginContext {
  static createRoot(
    name: string,
    username: string,
    triggersCreator: () => TriggerCollection,
    plugins: PluginMap,
    mud: Mud,
  ) {
    const context = new Context(
      name,
      username,
      mud.send,
      triggersCreator,
      pluginsGetterCreator(plugins),
    );

    Object.assign(context, {
      isRunning: mud.isRunning.bind(mud),
      register: mud.workflow.bind(mud),
      runWorkflow: mud.run.bind(mud),
    });

    return context;
  }

  private static fromParent(name: string, parent: Context) {
    const child = new Context(
      name,
      parent.username,
      parent.send,
      parent.triggersCreator,
      parent.pluginsCreator,
    );

    Object.assign(child, {
      isRunning: parent.isRunning,
      register: parent.register,
      runWorkflow: parent.runWorkflow,
    });

    return child;
  }

  private readonly children: { cancel(): void }[] = [];
  private readonly runWorkflow!: Mud['run'];
  private finish: ((reason: any) => void) | null = null;

  readonly plugins: PluginMap;
  readonly isRunning!: Mud['isRunning'];
  readonly register!: Mud['workflow'];

  constructor(
    name: string,
    username: string,
    send: Mud['send'],
    private readonly triggersCreator: () => TriggerCollection,
    private readonly pluginsCreator: (context: Context) => PluginMap,
  ) {
    super(name, username, triggersCreator(), send);
    this.plugins = pluginsCreator(this);
    bindAll(this, Context as any);
  }

  run(name: string, params: any[] = []) {
    this.checkNotAborted();
    this.log(`Invoke workflow "${name}" with`, ...params);

    const execution = this.runWorkflow(name, params, {
      context: this.createChild(name),
    });

    this.children.push(execution);

    execution.then(
      result => this.log(`Invocation "${name}" returned `, result),
      error => this.log(`Invocation "${name}" failed `, error),
    );

    return execution;
  }

  runForever() {
    this.checkNotAborted();
    return new Promise(resolve => (this.finish = resolve));
  }

  createChild(name?: string) {
    const child = Context.fromParent(
      `${this.name}->${name || this.children.length}`,
      this,
    );

    if (this.isPrintingLogs) {
      child.printLogs;
    }

    return child;
  }

  abort(fromExecution?: boolean) {
    if (this.isAborted) return;

    super.abort();

    if (this.finish) {
      this.finish(
        `Workflow aborted from ${fromExecution ? 'execution' : 'context'}`,
      );
    }

    for (const child of this.children) {
      child.cancel();
    }
  }
}

function pluginsGetterCreator(source: PluginMap) {
  return (context: Context) => {
    return new Proxy(source, {
      get(target, key: string) {
        if (!(key in target)) {
          context.log(`Failed to get plugin ${key}`);
          throw new Error(`Plugin ${key} is not registered.`);
        }

        context.log(`Requires plugin ${key}`);
        // TODO: bind plugin to context
        return target[key as keyof typeof target];
      },
    });
  };
}
