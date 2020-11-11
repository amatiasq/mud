import { Context } from './../lib/workflow/Context';

export async function train({
  when,
  run: invokeWorkflow,
  plugins: { navigation: nav, prompt },
}: Context) {
  const enemies: string[] = [];
  let direction = 'sur';

  await nav.recall();
  await nav.go('abajo');

  const enemySpotted = (prey: string) => () => enemies.push(prey);
  const enemyGone = (prey: string) => () => {
    const index = enemies.indexOf(prey);
    if (index > -1) {
      enemies.splice(index, 1);
    }
  };

  when(
    [
      'Un pequenyo caracol esta aqui haciendo trompos.',
      'El pequenyo caracol llega desde el',
    ],
    enemySpotted('pequenyo caracol'),
  );

  when(
    ['Un buitre carronyero esta aqui.', 'El buitre carronyero llega desde el'],
    enemySpotted('buitre carronyero'),
  );

  when(
    [
      'Un lobo hambriento te esta mirando.',
      'El lobo hambriento llega desde el',
    ],
    enemySpotted('lobo hambriento'),
  );

  when(
    [
      'Una serpiente que parece venenosa te mira fijamente.',
      'La serpiente llega desde el',
    ],
    enemySpotted('serpiente'),
  );

  when('El pequenyo caracol se va hacia el', enemyGone('pequenyo caracol'));
  when('El buitre carronyero se va hacia el', enemyGone('buitre carronyero'));
  when('El lobo hambriento se va hacia el', enemyGone('lobo hambriento'));
  when('La serpiente se va hacia el', enemyGone('serpiente'));

  await nav.execute('xsexnexsexnexs', checkRoom);
  return nav.execute('4w5nu');

  async function checkRoom() {
    await prompt.until(({ mv: { current: mv } }) => mv > 50);

    while (enemies.length) {
      const result = await invokeWorkflow('kill', [enemies.pop()!]);

      if (result === 'flee') {
        console.log('Had to run. Train over.');
        return nav.recall();
      }
    }
  }
}
