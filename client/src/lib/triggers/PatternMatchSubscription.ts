import { PatternPromise } from './PatternPromise';

export interface PatternMatchSubscription {
  unsubscribe(): void;
  once(): PatternPromise;
}
