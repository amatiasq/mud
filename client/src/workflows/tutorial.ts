import { Context } from '../lib';
import { conversation } from '../util/conversation';

export async function tutorial({
  when,
  write,
  run,
  plugins: { prompt },
}: Context) {
  const qa = conversation(when, write);

  await qa({
    'Escribe MIRAR CARTEL para empezar el aprendizaje': 'mirar cartel',
    'Para continuar el aprendizaje escribe NORTE': 'norte',
    'mirame con el comando MIRAR POLARD': 'mirar polard',
    'Escribe esto: DECIR HOLA': 'decir hola',
    'Ahora puedes ir hacia el NORTE': 'norte',
    'escribe COGER HOJA para cogerlo del suelo': 'coger hoja',
    'Escribe: DAR HOJA VERNER': 'dar hoja verner',
    'Para usarla escribe: VESTIR ARMADURA': 'vestir armadura',
    'Ahora continua hacia el ESTE': 'este',
    'cuando termines escribe: DECIR LISTO': 'decir listo',
    'Ahora escribe: TIRAR MASCARA': 'tirar mascara',
    'Ahora escribe: COGER MASCARA': 'coger mascara',
    'Ahora escribe: VESTIR MASCARA': 'vestir mascara',
    'Escribe ESTE para pasar al siguiente nivel de aprendizaje': 'este',
    'para ello ves al NORTE y escribe MATAR ORCO': 'norte',
    'Un asqueroso orco aparece para enfrentarse a ti': 'matar orco',
    'El cadaver de el orco contiene': 'sur',
    'Ves al ESTE para continuar tu aprendizaje': 'este',
    'Escribiendo PRACTICAR veras la lista': 'practicar',

    // pause

    'PRACTICA lo que creas necesario': 'practicar luz',
    'Practicas luz eterna': 'practicar estilo evasivo',
    'Practicas estilo evasivo': 'decir listo',
    'Para continuar, escribe DECIR LISTO': 'decir listo',

    'Para ello escribe ENTRENAR CON': 'entrenar con',
    'Sientes como tu con': 'entrenar sab',
    'Sientes como tu sab': 'decir listo',

    'Te llevare cuando digas DECIR LLEVAME': 'decir llevame',
    'Ves al NORTE a matarlos': 'norte',
  });

  write('estilo evasivo');

  await killAll('monstruito', 'Un monstruito que te mira mientras babea');
  write('sur');

  await when('que te encargues de los bichos del ESTE');
  write('este');

  await killAll('kobold', 'Un kobold con las manos atadas te mira fijamente');
  write('oeste');

  await when('Ahora a por los del OESTE');
  write('oeste');

  await killAll('minotauro', 'Un minotauro grunye mientras te mira fijamente');
  write('este');

  await when('Ya solo te quedan los del SUR');
  write('sur');

  await killAll('gnoll', 'Un joven gnoll esta aqui preparado para atacarte');
  write('tirar todo');
  write('norte');

  await qa({
    'Continua hacia ABAJO': 'abajo',
    'escribe COMPRAR': 'lista',
    'Un odre de cuero': 'comprar odre',
    'Escribe BEBER ODRE': 'beber odre',
    'Bebes agua de un odre de cuero': 'norte',
    'Quieres escucharlos?': 'decir no',
    'Si quieres irte simplemente escribe RECALL': 'recall',
  });

  async function killAll(mob: string, presence: string) {
    await when('Combates para ');

    let enemies = 0;
    const sus = when(presence, () => enemies++);
    await prompt.until();
    sus.unsubscribe();

    for (let i = 0; i < enemies; i++) {
      await run('kill', [mob]);
      await prompt.until();
      write('coger todo cuerpo');
      await prompt.until();
      write('vestir todo');
      await prompt.until();
    }
  }
}
