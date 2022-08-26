import { BasicContext } from '../lib/context/BasicContextCreator';

export async function login(
  { when, write, log }: BasicContext,
  username: string,
  password: string,
  initialize: () => Promise<any>,
) {
  await when('Entra el nombre de tu personaje o escribe Nuevo:');
  write(username);
  log('Username sent, waiting for password request');

  await when('Password:');
  write(password, { password: true });
  log(`Logged in as ${username}`);

  when('Pulsa [ENTER]', () => write(''));

  await when.any(
    when('Reconectando.', {
      blockProcessingUntil: initialize,
    }),
    when('Bienvenido a Balzhur...', {
      blockProcessingUntil: initialize,
    }),
  );
}
