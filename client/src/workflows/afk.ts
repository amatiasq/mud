import { Context } from './../lib/workflow/Context';

export async function afk(
  { abort, run, when, plugins: { prompt, navigation } }: Context,
  ...areas: string[]
) {
  when('.. Todo empieza a volverse negro.\n', abort);

  await action();

  async function action(): Promise<void> {
    await prompt.whenFresh();
    await run('repair');
    await run('dope');
    await prompt.whenFresh();
    console.log('Stats 100%. Start train...');

    try {
      await run('train', [rand(areas || [])]);
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

function rand<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
