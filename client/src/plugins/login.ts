import { BasicContext } from '../lib/context/BasicContextCreator';
import { conversation } from '../util/conversation';
import { getEmail } from '../util/getEmail';

export async function login(
  { when, write, log }: BasicContext,
  username: string,
  password: string,
  initialize: () => Promise<any>,
) {
  await when('Entra el nombre de tu personaje o escribe Nuevo:');
  write(username);
  log('Username sent, waiting for password request');

  await Promise.any([
    when('Password:').then(authenticate),
    when('Ese jugador no existe').then(create),
  ]);

  when('Pulsa [ENTER]', () => write(''));

  await when.any(
    when('Reconectando.', {
      blockProcessingUntil: initialize,
    }),
    when('Bienvenido a Balzhur...', {
      blockProcessingUntil: initialize,
    }),
  );

  function authenticate() {
    write(password, { password: true });
    log(`Logged in as ${username}`);
  }

  async function create() {
    write('Nuevo');

    const qa = conversation(when, write);

    await qa({
      'Cual es tu sexo (H)ombre, (M)ujer o (N)eutral?': 'N',
      // Mago Clerigo Ladron Guerrero Vampiro Druida Montaraz Bardo Paladin
      'Selecciona una profesion': 'Druida',
      // Humano Elfo Enano Hada Medio-Elfo Gnomo
      'Escoge una raza o escribe ayuda [raza] para saber mas sobre ellas:':
        'elfo',
      'Por favor escoge el nombre': username,
      'Estas seguro de querer escoger': 's',
      'Escoge un buen password': password,
      'Vuelve a escribir el password para confirmarlo': password,
      'Tienes alguna otra ficha creada?': 'n',
      'Quieres calcular tus caracteristicas al azar o repartir manualmente':
        'a',
    });

    let bestRoll = { roll: 0, total: 0 };

    const rollTableSuscription = when(
      /^\|\s+(?<roll>\d+).+?(?<total>\d+) \|$/m,
      ({ groups }) => {
        if (parseInt(groups.total, 10) > bestRoll.total) {
          bestRoll = groups as any;
        }
      },
    );

    await when('Con qué numero de tirada quieres quedarte?');
    write(`${bestRoll.roll}`);
    rollTableSuscription.unsubscribe();

    await qa({
      '¿Qué cuenta de correo quieres asociar a tu personaje?':
        getEmail(username),
      '¿Es correcto? (S/N)': 's',
    });
  }
}
