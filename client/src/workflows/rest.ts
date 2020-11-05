import { Context } from './../lib/workflow/Context';

export async function rest({ when, write, runForever }: Context) {
  when('Desapareces en la nada.', () => write('mirar'));

  when(['Nah... Estas demasiado relajado...', 'En tus suenyos o que?'], () =>
    write('despertar'),
  );

  await runForever();
}
