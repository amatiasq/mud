import { PatternPromise } from './PatternPromise';
import { PatternResult } from './PatternResult';

export interface PatternMatchSubscription {
  unsubscribe(): void;
  once(): PatternPromise;
}
