import { Context } from './Context';

export class Workflow<Args extends any[] = any[], Return = any> {
  private executionCount = 0;
  private currentExecutions = 0;

  get isRunning() {
    return this.currentExecutions > 0;
  }

  get timesExecuted() {
    return this.executionCount;
  }

  constructor(
    readonly name: string,
    private readonly run: (
      context: Context,
      ...args: Args
    ) => Promise<Return> | void,
  ) {}

  async execute(context: Context, ...args: Args) {
    this.currentExecutions++;
    const iteration = this.executionCount++;

    context.log(`[Exe(${iteration})]`, ...args);

    try {
      const result = await this.run(context, ...args);
      context.log(`[Res(${iteration}]`, result);
      return result;
    } catch (error) {
      context.log(`[ERR(${iteration})]`, error);
      throw error;
    } finally {
      this.currentExecutions--;
    }
  }
}
