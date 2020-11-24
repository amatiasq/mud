import { emitter } from '@amatiasq/emitter';

import { initializePlugins, PluginMap } from '../plugins/index';
import { login } from '../plugins/login';
import { BasicContextCreator } from './context/BasicContextCreator';
import {
  WorkflowContext,
  WorkflowContextCreator,
} from './context/WorkflowContextCreator';
import { RemoteTelnet } from './RemoteTelnet';
import { TriggerCollection } from './triggers/TriggerCollection';
import { Workflow } from './workflow/Workflow';
import { WorkflowFn } from './workflow/WorkflowFn';
import { WriteOptions } from './WriteOptions';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows = new Map<string, Workflow>();
  private readonly contextCreator = new BasicContextCreator(
    this.triggers,
    this.send.bind(this),
  );

  private readonly handlers: {
    id: string;
    handler: (command: string) => void | true;
  }[] = [];

  private plugins!: PluginMap;
  // private username!: string;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  private readonly emitWorkflowsChange = emitter<Workflow[]>();
  readonly onWorkflowsChange = this.emitWorkflowsChange.subscribe;

  private emitLoggedIn!: (usernamne: string) => void;
  readonly whenLoggedIn = new Promise(resolve => (this.emitLoggedIn = resolve));

  constructor(private readonly telnet: RemoteTelnet) {
    this.telnet.onData(x => this.triggers.process(removeNoise(x)));
  }

  async login(user: string, pass: string) {
    const context = this.contextCreator.createInstance('login');

    await login(context, user, pass, async () => {
      this.plugins = await initializePlugins(
        this.contextCreator.createInstance.bind(this.contextCreator),
      );
    });

    this.contextCreator.dispose(context);
    // this.username = user;
    this.emitLoggedIn(user);
  }

  send(text: string, options: WriteOptions = {}) {
    this.emitCommand(options.password ? '*'.repeat(text.length) : text);
    this.telnet.send(text);
  }

  // User input

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

  // Plugins

  getPlugin<Name extends keyof PluginMap>(name: Name): PluginMap[Name] {
    return this.plugins[name];
  }

  // Daemons

  daemon(name: string, run: WorkflowFn<[]>) {
    this.runOnce(name, async (context: WorkflowContext) => {
      await run(context);
      return context.runForever();
    });
  }

  // Workflows

  workflow(name: string, run: WorkflowFn<any[]>) {
    const workflow = new Workflow(name, run, this.createContextCreator());
    this.workflows.set(workflow.name, workflow);
    this.emitWorkflowsChange([...this.workflows.values()]);
    return workflow;
  }

  runOnce(name: string, run: WorkflowFn<[]>) {
    return new Workflow(name, run, this.createContextCreator()).execute();
  }

  getWorkflow(workflowOrName: Workflow | string) {
    if (workflowOrName instanceof Workflow) {
      return workflowOrName;
    }

    if (!this.workflows.has(workflowOrName)) {
      throw new Error(`Workflow "${workflowOrName}" is not registered.`);
    }

    return this.workflows.get(workflowOrName)!;
  }

  private createContextCreator() {
    return new WorkflowContextCreator(this, this.triggers, this.plugins);
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
