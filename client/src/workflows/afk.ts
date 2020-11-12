import { Context } from './../lib/workflow/Context';

export async function afk({ run, plugins: { prompt, navigation } }: Context) {
  await action();

  async function action(): Promise<void> {
    await prompt.whenFresh();
    await run('dope');
    await prompt.whenFresh();
    console.log('Stats 100%. Start train...');

    try {
      await run('train');
      console.log('workflow completed');
    } catch (error) {
      console.log('workflow failed');
    }

    if (navigation.isAtRecall) {
      await run('bank');
    }

    return action();
  }
}
