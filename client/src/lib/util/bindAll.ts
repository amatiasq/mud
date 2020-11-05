export function bindAll<T extends {}>(
  target: T,
  source: { new (...args: any[]): T },
) {
  const proto = source.prototype;
  const keys = Object.getOwnPropertyNames(proto) as (keyof T)[];

  keys
    .filter(key => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;
      return typeof descriptor.value === 'function';
    })
    .forEach(method => {
      target[method] = (target[method] as any).bind(target);
    });
}
