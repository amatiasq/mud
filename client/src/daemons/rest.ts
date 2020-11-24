import { Context } from '../lib';

export async function rest({ when, write }: Context) {
  when(
    [
      'Nah... Estas demasiado relajado...',
      'En tus suenyos o que?',
      'Estas demasiado relajado para lanzar ese conjuro.',
      'Estas demasiado relajado para lanzar ese conjuro.',
    ],
    () => write('despertar'),
  );
}
