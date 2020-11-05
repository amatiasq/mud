import { Mud } from './../Mud';
import { ExecutionAbortedError } from './../ExecutionAbortedError';
import bindAll from 'lodash.bindall';

import { PluginContext } from '../PluginContext';
import { PluginMap } from '../../plugins/index';
import { TriggerCollection } from '../triggers/TriggerCollection';
import { MissingPluginError } from './MissingPluginError';

export class Context extends PluginContext {
  private finish: ((reason: any) => void) | null = null;

  readonly plugins: PluginMap;

  constructor(
    name: string,
    username: string,
    triggers: TriggerCollection,
    plugins: PluginMap,
    send: (command: string) => void,
    private readonly runWorkflow: Mud['invokeWorkflow'],
  ) {
    super(`W(${name})`, username, triggers, send);
    this.plugins = createPluginsGetter(plugins, this.log.bind(this));

    bindAll(this, ['invokeWorkflow', 'runForever']);
  }

  invokeWorkflow<T>(name: string, params: any[] = []) {
    this.checkNotAborted();
    this.log(`Invoke workflow ${name} with`, ...params);
    return this.runWorkflow(name, params, { logs: this.isPrintingLogs });
  }

  runForever() {
    return new Promise(resolve => (this.finish = resolve));
  }

  abort() {
    super.abort();

    if (this.finish) {
      this.finish(new ExecutionAbortedError());
    }
  }
}

function createPluginsGetter(source: PluginMap, log: Function) {
  return new Proxy(source, {
    get(target, key: string) {
      if (!(key in target)) {
        log(`Failed to get plugin ${key}`);
        throw new MissingPluginError(`Plugin ${key} is not registered.`);
      }

      log(`Requires plugin ${key}`);
      return target[key as keyof typeof target];
    },
  });
}
