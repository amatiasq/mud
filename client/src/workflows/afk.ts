import { Context } from '../lib';

export async function afk(
  { abort, log, run, when, write, plugins: { navigation, prompt } }: Context,
  ...areas: string[]
) {
  const initialExp = prompt.getValue('exp');
  let died = false;

  console.log({ initialExp });

  when('.. Todo empieza a volverse negro.\n', async () => {
    died = true;

    await prompt.until();

    const exp = prompt.getValue('exp');

    if (exp > initialExp) {
      abort();
    }
  });

  while (true) {
    if (died) {
      await when('El cadaver de May pasa a convertirse en polvo');
      died = false;
    }

    await action();
    log('AFK Completed. Restarting...');
  }

  async function action(): Promise<void> {
    try {
      await run('recover');
      await run('repair');
      await run('learn');
      await run('dope');
      await run('recover');
    } catch (error) {
      console.log('Preparation error', error);
    }

    try {
      await run('train', rand(areas || []));
    } catch (error) {
      console.log('Train error', error);
    }

    try {
      const realm = await navigation.getRealm();

      if (realm === 'Calimhar' && navigation.isAtRecall) {
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
