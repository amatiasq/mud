import { getAreaMetadata, Realm } from '../data/areas';
import { Context } from '../lib';

const PATH = /^r?((?:x|\d+)?[nsewudohjkl])+$/i;
const TRAVEL = 'un pergamino de viajar';

const REALM_RECALLS: Record<Realm, string | null> = {
  Calimhar: 'DarkHaven',
  Earand: 'Justicia',
  Valmorag: 'Tinieblas',
  Niruk: null,
};

export async function go(
  { run, when, write, plugins: { navigation, inventory, skills } }: Context,
  path: string,
) {
  if (PATH.test(path)) {
    return navigation.execute(path);
  }

  const area = getAreaMetadata(path);

  if (!area) {
    throw new Error(`Can't resolve path or area "${path}"`);
  }

  if (!area.path) {
    throw new Error(`Area ${area.name} doesn't have a path`);
  }

  const realm = await navigation.getRealm();

  if (area.realm === realm) {
    return navigation.execute(area.path);
  }

  const recall = REALM_RECALLS[area.realm];

  if (!recall) {
    throw new Error(`Realm ${area.realm} doesn't have recall.`);
  }

  if (await skills.can('viajar')) {
    if (await run('cast', 'viajar', recall)) {
      return navigation.execute(area.path);
    }
  }

  let canTravel = false;

  if (await inventory.has(TRAVEL)) {
    canTravel = true;
  } else if (await inventory.hasInBackpack(TRAVEL)) {
    write('coger viajar mochila');

    canTravel = await when.any(
      when('Coges un pergamino de viajar de').then(() => true),
      when('No hay nada parecido a eso en').then(() => false),
    );
  }

  if (canTravel) {
    write(`recitar viajar ${recall}`);
    await when('Recitas un pergamino de viajar.').timeout(3);
    return navigation.execute(area.path);
  }

  throw new Error(`No way to travel to ${area.name} in ${area.realm}`);
}
