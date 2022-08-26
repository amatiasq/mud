import { CancellablePromise } from './CancellablePromise';

export function wait(seconds: number) {
  let timer: number;

  const promise = new CancellablePromise<void>(resolve => {
    timer = setTimeout(resolve, seconds * 1000);
  });

  promise.onCancel(() => clearTimeout(timer));

  return promise;
}
