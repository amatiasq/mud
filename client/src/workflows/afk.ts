import { Context } from './../lib/workflow/Context';

export async function afk(
  { abort, run, when, printLogs, plugins: { navigation } }: Context,
  ...areas: string[]
) {
  let isAborted = false;

  when('.. Todo empieza a volverse negro.\n', () => {
    isAborted = true;
    abort();
  });

  while (!isAborted) {
    await action();
  }

  async function action(): Promise<void> {
    try {
      await run('recover');
      await run('repair');
      await run('dope');
      await run('recover');
    } catch (error) {
      console.log('Preparation error', error);
    }

    console.log('Stats 100%. Start train...');

    try {
      await run('train', [rand(areas || [])]);
      console.log('workflow completed');
    } catch (error) {
      console.log('workflow failed');
    }

    try {
      if (navigation.isAtRecall) {
        await run('bank');
      }
    } catch (error) {
      console.log('Bank error', error);
    }
  }
}

function rand<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
