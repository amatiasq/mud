import { emitter } from '@amatiasq/emitter';

type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;
type PromiseRejector<T> = (reason?: T) => void;

export type PromiseExecutor<T> = (
  resolve: PromiseResolver<T>,
  reject: PromiseRejector<any>,
) => void;

export type PromiseOnFulfilled<Input, Result> =
  | ((value: Input) => Result | PromiseLike<Result>)
  | undefined
  | null;
export type PromiseOnRejected<Reason, Result> =
  | ((reason: Reason) => Result | PromiseLike<Result>)
  | undefined
  | null;

export type CancellableExecutor<T> = (
  resolve: PromiseResolver<T>,
  reject: PromiseRejector<any>,
  onCancel: (listener: () => void) => void,
) => void;

// Tell typescript how this works now
export interface CancellablePromise<T> {
  // then<Result1 = T, Result2 = never>(
  //   onfulfilled?: PromiseOnFulfilled<T, Result1>,
  //   onrejected?: PromiseOnRejected<any, Result2>,
  // ): CancellablePromise<Result1 | Result2>;
  catch<Result = T>(
    onrejected?: PromiseOnRejected<any, Result>,
  ): CancellablePromise<Result>;
  finally(onfinally?: (() => void) | undefined | null): CancellablePromise<T>;
}

export class CancellablePromise<T> extends Promise<T> {
  private readonly emitCancel;
  readonly onCancel;

  private state!: 'resolved' | 'rejected' | 'pending' | 'cancelled';

  get isCancelled() {
    return this.state === 'cancelled';
  }

  get isPending() {
    return this.state === 'pending';
  }

  get isResolved() {
    return this.state === 'resolved';
  }

  get isRejected() {
    return this.state === 'rejected';
  }

  constructor(executor: CancellableExecutor<T>) {
    const emitCancel = emitter<void>();
    const onCancel = emitCancel.subscribe;

    super((resolve, reject) => {
      executor(
        value => {
          if (this.isPending || this.isCancelled) {
            this.state = 'resolved';
            resolve(value);
          }
        },
        reason => {
          if (this.isPending || this.isCancelled) {
            this.state = 'rejected';
            reject(reason);
          }
        },
        onCancel,
      );
    });

    this.state = 'pending';
    this.emitCancel = emitCancel;
    this.onCancel = onCancel;
  }

  then<Result1 = T, Result2 = never>(
    onfulfilled?: PromiseOnFulfilled<T, Result1>,
    onrejected?: PromiseOnRejected<any, Result2>,
  ) {
    const result = super.then(onfulfilled, onrejected) as CancellablePromise<
      Result1 | Result2
    >;
    result.onCancel(() => this.cancel());
    this.onCancel(() => result.cancel());
    return result;
  }

  // finally(onfinally?: (() => void) | undefined | null) {
  //   if (onfinally) {
  //     this.onCancel(onfinally);
  //   }

  //   super.finally(onfinally);
  //   return this;
  // }

  cancel() {
    if (this.isPending) {
      this.state = 'cancelled';
      this.emitCancel();
    }
  }
}
