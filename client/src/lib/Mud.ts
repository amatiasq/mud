import { CancellablePromise } from './util/CancellablePromise';
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
import { WriteOptions } from './WriteOptions';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows = new Map<string, Workflow>();

  private readonly handlers: {
    id: string;
    handler: (command: string) => void | true;
  }[] = [];

  private plugins!: PluginMap;
  private username!: string;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  private readonly emitWorkflowsChange = emitter<Workflow[]>();
  readonly onWorkflowsChange = this.emitWorkflowsChange.subscribe;

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

  workflow(name: string, run: WorkflowFn<any[]>) {
    const workflow = new Workflow(name, run);
    this.workflows.set(workflow.name, workflow);
    this.emitWorkflowsChange([...this.workflows.values()]);
    return workflow;
  }

  runOnce(name: string, run: WorkflowFn<[]>) {
    return this.executeWorkflow(new Workflow(name, run));
  }

  run(
    workflowOrName: Workflow | string,
    params?: any[],
    options?: InvokeOptions,
  ) {
    const workflow =
      typeof workflowOrName === 'string'
        ? this.getWorkflow(workflowOrName)
        : workflowOrName;

    return this.executeWorkflow(workflow, params, options);
  }

  isRunning(workflowOrName: Workflow | string) {
    const workflow =
      typeof workflowOrName === 'string'
        ? this.getWorkflow(workflowOrName)
        : workflowOrName;

    return workflow.isRunning;
  }

  private getWorkflow(name: string) {
    if (!this.workflows.has(name)) {
      throw new Error(`Workflow "${name}" is not registered.`);
    }

    return this.workflows.get(name)!;
  }

  private executeWorkflow(
    workflow: Workflow,
    params: any[] = [],
    { context = this.createRootContext(workflow.name) }: InvokeOptions = {},
  ) {
    return workflow
      .execute(context, ...params)
      .finally(() => context.dispose());
  }

  private createRootContext(name: string): Context {
    return Context.createRoot(
      name,
      this.username,
      () => this.triggers,
      this.plugins,
      this,
    );
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

let stored = '';

function removeAsciiCodes(text: string) {
  if (stored) {
    text = `${stored}${text}`;
    stored = '';
  }

  const match = text.match(/\u001b[^m]*?$/);

  if (match) {
    stored = match[0];
    text = text.substr(0, text.length - stored.length);
  }

  return text.replace(/\u001b\[[^m]*?m/g, '');
}
