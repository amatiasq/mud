export function singleExecution<Return>(fn: () => Promise<Return>) {
  let running: Promise<Return> | null = null;

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
