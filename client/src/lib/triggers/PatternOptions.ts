export interface PatternOptions {
  captureLength?: number;
  blockProcessingUntil?: () => PromiseLike<any>;
}
