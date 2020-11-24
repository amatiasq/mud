export function singleExecution<Return>(fn: () => PromiseLike<Return>) {
  let running: PromiseLike<Return> | null = null;

  return () => {
    if (running) {
      return running;
    }

    running = fn().then(x => {
      running = null;
      return x;
    });

    return running;
  };
}
