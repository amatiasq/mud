import { emitter } from '@amatiasq/emitter';

import { initializePlugins, PluginMap } from '../plugins/index';
import { login } from '../plugins/login';
import { PluginContext } from './PluginContext';
import { RemoteTelnet } from './RemoteTelnet';
import { TriggerCollection } from './triggers/TriggerCollection';
import { Context } from './workflow/Context';
import { InvokeOptions } from './workflow/InvokeOptions';
import { Workflow } from './workflow/Workflow';
import { WorkflowFn } from './workflow/WorkflowFn';
import { WorkflowNotFoundError } from './workflow/WorkflowNotFoundError';
import { WriteOptions } from './WriteOptions';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows: Record<string, Workflow> = {};
  private readonly handlers: {
    id: string;
    handler: (command: string) => void | true;
  }[] = [];
  private plugins!: PluginMap;
  private username!: string;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  private emitLoggedIn!: (usernamne: string) => void;
  readonly whenLoggedIn = new Promise(resolve => (this.emitLoggedIn = resolve));

  constructor(private readonly telnet: RemoteTelnet) {
    this.workflow = this.workflow.bind(this);
    this.send = this.send.bind(this);
    this.run = this.run.bind(this);
    this.telnet.onData(x => this.triggers.process(removeNoise(x)));
  }

  async login(user: string, pass: string) {
    const context = new PluginContext('login', 'N/A', this.triggers, this.send);

    await login(context, user, pass, async () => {
      this.plugins = await initializePlugins(
        name => new PluginContext(name, user, this.triggers, this.send),
      );
    });

    context.dispose();
    this.username = user;
    this.emitLoggedIn(user);
  }

  send(text: string, options: WriteOptions = {}) {
    this.emitCommand(options.password ? '*'.repeat(text.length) : text);
    this.telnet.send(text);
  }

  userInput(command: string): boolean {
    const x = this.handlers.find(x => command.startsWith(x.id));
    return Boolean(!x || x.handler(command.substr(x.id.length)));
  }

  registerHandler(
    identifier: string,
    handler: (command: string) => void | true,
  ) {
    this.handlers.push({ id: identifier, handler });
  }

  getPlugin<Name extends keyof PluginMap>(name: Name): PluginMap[Name] {
    return this.plugins[name];
  }

  daemon<Args extends any[]>(
    name: string,
    run: WorkflowFn<[]>,
    params?: Args,
    options?: InvokeOptions,
  ) {
    const workflow = new Workflow(name, async (context: Context) => {
      await run(context);
      return context.runForever();
    });

    return this.executeWorkflow(workflow, params, options);
  }

  workflow<Args extends any[]>(name: string, run: WorkflowFn<Args>) {
    const workflow = new Workflow(name, run);
    this.workflows[workflow.name] = workflow as Workflow<any>;
    return workflow;
  }

  runOnce(name: string, run: WorkflowFn<[]>) {
    return this.executeWorkflow(new Workflow(name, run));
  }

  run(name: string, params?: any[], options?: InvokeOptions) {
    if (!(name in this.workflows)) {
      throw new WorkflowNotFoundError(`Workflow "${name}" is not registered.`);
    }

    const workflow = this.workflows[name];
    return this.executeWorkflow(workflow, params, options);
  }

  private executeWorkflow(
    workflow: Workflow,
    params: any[] = [],
    { logs }: InvokeOptions = {},
  ) {
    const context = this.createWorkflowContext(workflow.name);

    if (logs) {
      context.printLogs;
    }

    const promise = workflow.execute(context, ...params).then(result => {
      context.dispose();
      return result;
    });

    return Object.assign(promise, {
      abort() {
        context.abort();
      },
    }) as typeof promise & { abort(): void };
  }

  private createWorkflowContext(name: string): Context {
    return new Context(
      name,
      this.username,
      this.triggers,
      this.plugins,
      this.send,
      this.workflow,
      this.run,
    );
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

function removeAsciiCodes(text: string) {
  return text.replace(/\u001b\[.*?m/g, '');
}
