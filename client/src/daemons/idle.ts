import { Context } from './../lib/workflow/Context';

export async function idle({
  when,
  write,
  run: invokeWorkflow,
  runForever,
  plugins: { navigation },
}: Context) {
  when('Desapareces en la nada.', () => {
    console.log('IDLE');

    if (navigation.isAtRecall) {
      invokeWorkflow('train');
    } else {
      write('estado');
    }
  });

  await runForever();
}
