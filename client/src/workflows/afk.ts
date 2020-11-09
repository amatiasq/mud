import { Context } from './../lib/workflow/Context';

export async function afk({ run, runForever, plugins: { prompt } }: Context) {
  await action();

  async function action(): Promise<void> {
    await prompt.until(
      stats =>
        stats.hp.percent === 1 &&
        stats.mana.percent === 1 &&
        stats.mv.percent === 1,
    );

    console.log('Stats 100%. Start train...');

    try {
      await run('train');
      console.log('workflow completed');
    } catch (error) {
      console.log('workflow failed');
    }

    await run('bank');

    return action();
  }
}
