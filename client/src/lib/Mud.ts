import { emitter } from '@amatiasq/emitter';

import { initializePlugins, PluginMap } from '../plugins/index';
import { login } from '../plugins/login';
import { PluginContext } from './PluginContext';
import { RemoteTelnet } from './RemoteTelnet';
import { TriggerCollection } from './triggers/TriggerCollection';
import { Context } from './workflow/Context';
import { InvokeOptions } from './workflow/InvokeOptions';
import { Workflow } from './workflow/Workflow';
import { WorkflowNotFoundError } from './workflow/WorkflowNotFoundError';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows: Record<string, Workflow> = {};
  private plugins!: PluginMap;
  private username!: string;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  private emitLoggedIn!: (usernamne: string) => void;
  readonly whenLoggedIn = new Promise(resolve => (this.emitLoggedIn = resolve));

  constructor(private readonly telnet: RemoteTelnet) {
    this.send = this.send.bind(this);
    this.invokeWorkflow = this.invokeWorkflow.bind(this);
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

  send(text: string) {
    this.emitCommand(text);
    this.telnet.send(text);
  }

  userInput(command: string): void {}

  getPlugin<Name extends keyof PluginMap>(name: Name): PluginMap[Name] {
    return this.plugins[name];
  }

  runWorkflow<Args extends any[]>(
    run: (context: Context, ...args: Args) => Promise<any> | void,
    params?: Args,
    options?: InvokeOptions,
  ) {
    const workflow = new Workflow(run);
    return this.executeWorkflow(
      workflow as Workflow<any, any>,
      params,
      options,
    );
  }

  registerWorkflow<Args extends any[]>(
    run: (context: Context, ...args: Args) => Promise<any> | void,
  ) {
    const workflow = new Workflow(run);
    this.workflows[workflow.name] = workflow as Workflow<any, any>;
    return workflow;
  }

  invokeWorkflow(name: string, params?: any[], options?: InvokeOptions) {
    if (!(name in this.workflows)) {
      throw new WorkflowNotFoundError(`Workflow ${name} is not registered.`);
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
    });
  }

  private createWorkflowContext(name: string): Context {
    return new Context(
      name,
      this.username,
      this.triggers,
      this.plugins,
      this.send,
      this.invokeWorkflow,
    );
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

function removeAsciiCodes(text: string) {
  return text.replace(/\u001b\[.*?m/g, '');
}
