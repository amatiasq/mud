import { Context } from './../lib/workflow/Context';

export async function rest({ when, write }: Context) {
  when(
    [
      'Nah... Estas demasiado relajado...',
      'En tus suenyos o que?',
      'Estas demasiado relajado para lanzar ese conjuro.',
    ],
    () => write('despertar'),
  );
}
