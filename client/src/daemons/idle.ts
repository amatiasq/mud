import { Context } from '../lib';

export async function idle({
  when,
  write,
  run,
  plugins: { navigation, skills },
}: Context) {
  when('Escribe MIRAR CARTEL para empezar el aprendizaje', () =>
    run('tutorial'),
  );

  when('Desapareces en la nada.', async () => {
    console.log('IDLE');

    if (!navigation.isAtRecall) {
      write('estado');
      return;
    }

    await run('train');

    if (await skills.can('invisibilidad')) {
      await run('cast', 'invisibilidad');
    }
  });
}
