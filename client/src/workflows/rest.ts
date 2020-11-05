import { Context } from './../lib/workflow/Context';

export async function rest({ write, watch, runForever }: Context) {
  watch('Desapareces en la nada.', () => write('mirar'));

  watch(['Nah... Estas demasiado relajado...', 'En tus suenyos o que?'], () =>
    write('despertar'),
  );

  await runForever();
}
