import { PluginContext } from '../lib/PluginContext';

export async function login(
  { when, write, log }: PluginContext,
  username: string,
  password: string,
  initialize: () => Promise<any>,
) {
  write(username);
  log('Username sent, waiting for password request');

  // TODO: "Reconectando..." no triggerea esto nunca

  await when('Password:');
  write(password);
  log(`Logged in as ${username}`);

  await Promise.any([
    when('Reconectando.'),
    (async () => {
      await when('Pulsa [ENTER]');
      write('');
      await when('Pulsa [ENTER]');
      write('');
    })(),
  ]);

  // Kids don't do this at home
  await when('Bienvenido a Balzhur...', initialize, { await: true }).once();
}
