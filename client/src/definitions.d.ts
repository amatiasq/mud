declare module 'ansi-to-html' {
  class Convert {
    toHtml(data: string): string;
  }

  export = Convert;
}

interface PromiseConstructor {
  any(promises: Promise<any>[]): Promise<any>;
}
