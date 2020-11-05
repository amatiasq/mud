import { PluginContext } from './PluginContext';

export async function login(
  { write, watch, waitFor, log }: PluginContext,
  username: string,
  password: string,
) {
  write(username);
  log('Username sent, waiting for password request');

  await waitFor('Password:');
  write(password);
  log(`Logged in as ${username}`);

  await waitFor('Pulsa [ENTER]');
  write('');
  await waitFor('Pulsa [ENTER]');
  write('');
  await waitFor('Bienvenido a Balzhur...');
}
