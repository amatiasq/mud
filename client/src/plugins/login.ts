import { PluginContext } from '../lib/PluginContext';

export async function login(
  { when, write, log }: PluginContext,
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

  await Promise.any([
    (async () => {
      await when('Reconectando.');
      await initialize();
    })(),
    (async () => {
      await when('Pulsa [ENTER]');
      write('');
      await when('Pulsa [ENTER]');
      write('');
      await when('Bienvenido a Balzhur...', initialize, { await: true }).once();
    })(),
  ]);
}
