import { emitter } from '@amatiasq/emitter';
import { ContextReplacementPlugin } from 'webpack';

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
  private readonly workflows: Record<string, Workflow> = {};

  private readonly runnning = new Set<{
    workflow: Workflow;
    context: Context;
    promise: Promise<any> & { abort(): void };
  }>();

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

    const execution = this.executeWorkflow(workflow, params, options);
    return execution.promise;
  }

  workflow<Args extends any[]>(name: string, run: WorkflowFn<Args>) {
    const workflow = new Workflow(name, run);
    this.workflows[workflow.name] = workflow as Workflow<any>;
    this.emitWorkflowsChange(Object.values(this.workflows));
    return workflow;
  }

  runOnce(name: string, run: WorkflowFn<[]>) {
    return this.executeWorkflow(new Workflow(name, run));
  }

  run(name: string, params?: any[], options?: InvokeOptions) {
    if (!(name in this.workflows)) {
      throw new Error(`Workflow "${name}" is not registered.`);
    }

    const workflow = this.workflows[name];
    const execution = this.executeWorkflow(workflow, params, options);

    this.runnning.add(execution);

    execution.promise.finally(() => {
      this.runnning.delete(execution);
      this.emitWorkflowsChange(Object.values(this.workflows));
    });

    this.emitWorkflowsChange(Object.values(this.workflows));
    return execution.promise;
  }

  stop(name: string) {
    const target = [...this.runnning].filter(x => x.workflow.name === name);
    target.forEach(x => x.promise.abort());
    this.emitWorkflowsChange(Object.values(this.workflows));
  }

  isRunning(name: string) {
    return [...this.runnning].some(x => x.workflow.name === name);
  }

  private executeWorkflow(
    workflow: Workflow,
    params: any[] = [],
    { logs }: InvokeOptions = {},
  ) {
    const context = this.createWorkflowContext(workflow.name);
    if (logs) context.printLogs;

    const promise = workflow.execute(context, ...params).then(result => {
      context.dispose();
      return result;
    });

    let abort!: () => void;
    const contexAbort = context.abort;

    const workflowPromise = new Promise((resolve, reject) => {
      promise.then(resolve, reject);
      abort = () => {
        contexAbort.call(context);
        reject();
      };
    });

    return {
      workflow,
      promise: Object.assign(workflowPromise, { abort }),
      context: Object.assign(context, { abort }),
    };
  }

  private createWorkflowContext(name: string): Context {
    return new Context(name, this.username, this.triggers, this.plugins, this);
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
