import { Context } from './../lib/workflow/Context';

export async function idle({
  when,
  write,
  run,
  plugins: { navigation, skills },
}: Context) {
  when('Desapareces en la nada.', async () => {
    console.log('IDLE');

    if (!navigation.isAtRecall) {
      write('estado');
      return;
    }

    await run('train');

    if (skills.has('invisibilidad')) {
      await run('cast', ['invisibilidad']);
    }
  });
}
