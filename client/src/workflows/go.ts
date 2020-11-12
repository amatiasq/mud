import { getAreaMetadata } from '../data/areas';
import { Context } from '../lib/workflow/Context';

export function go({ plugins: { navigation } }: Context, path: string) {
  const area = getAreaMetadata(path);

  if (area && area.path) {
    path = area.path;
    console.log(`Going ${area.name}`);
  }

  return navigation.execute(path);
}
