import { getAreaMetadata } from '../data/areas';
import { Context } from '../lib/workflow/Context';

const PATH = /^r?((?:x|\d+)?nsewudohjkl)+$/;

export function go({ plugins: { navigation } }: Context, path: string) {
  const area = PATH.test(path) ? null : getAreaMetadata(path);

  if (area && area.path) {
    path = area.path;
    console.log(`Going ${area.name}`);
  }

  return navigation.execute(path);
}
