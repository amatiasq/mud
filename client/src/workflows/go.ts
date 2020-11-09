import { Context } from './../lib/workflow/Context';

export function go({ plugins: { navigation } }: Context, path: string) {
  return navigation.execute(path);
}
