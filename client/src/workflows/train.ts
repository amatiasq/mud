import { Context } from './../lib/workflow/Context';

export async function train({
  abort,
  watch,
  invokeWorkflow,
  plugins: { navigation: nav },
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

  watch(
    [
      'Un pequenyo caracol esta aqui haciendo trompos.',
      'El pequenyo caracol llega desde el',
    ],
    enemySpotted('pequenyo caracol'),
  );

  watch(
    ['Un buitre carronyero esta aqui.', 'El buitre carronyero llega desde el'],
    enemySpotted('buitre carronyero'),
  );

  watch(
    [
      'Un lobo hambriento te esta mirando.',
      'El lobo hambriento llega desde el',
    ],
    enemySpotted('lobo hambriento'),
  );

  watch(
    [
      'Una serpiente que parece venenosa te mira fijamente.',
      'La serpiente llega desde el',
    ],
    enemySpotted('serpiente'),
  );

  watch('El pequenyo caracol se va hacia el', enemyGone('pequenyo caracol'));
  watch('El buitre carronyero se va hacia el', enemyGone('buitre carronyero'));
  watch('El lobo hambriento se va hacia el', enemyGone('lobo hambriento'));
  watch('La serpiente se va hacia el', enemyGone('serpiente'));

  return nextRoom();

  async function nextRoom(): Promise<any> {
    while (enemies.length) {
      if (await fight(enemies.pop()!)) {
        console.log('Had to run. Train over.');
        return;
      }
    }

    if (nav.canGo(direction)) {
      await nav.go(direction);
    } else if (nav.canGo('este')) {
      await nav.go('este');
      direction = direction === 'sur' ? 'norte' : 'sur';
    } else {
      return nav.execute('oooonnnnna');
    }

    return nextRoom();
  }

  async function fight(prey: string) {
    const isTargetDead = await invokeWorkflow('fight', [prey]);
    return !isTargetDead;
  }
}
