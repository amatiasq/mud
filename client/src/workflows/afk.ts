import { Context } from '../lib';

export async function afk(
  { abort, run, when, plugins: { navigation, prompt } }: Context,
  ...areas: string[]
) {
  const initialExp = prompt.getValue('exp');
  let isAborted = false;

  console.log({ initialExp });

  when('.. Todo empieza a volverse negro.\n', async () => {
    await prompt.until();

    const exp = prompt.getValue('exp');

    if (exp > initialExp) {
      isAborted = true;
      abort();
    }
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

    try {
      await run('train', [rand(areas || [])]);
    } catch (error) {
      console.log('Train error', error);
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
