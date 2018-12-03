declare module "@txo/debounce-promise" {

  declare type DebounceDuration = (() => number) | number

  declare interface DebauncePromiseOptions {
      immediate?: boolean;
      throwBouncedPromiseError?: boolean;
  };

  declare function debouncePromise<PROMISE_RESULT, ARGS>(
    fn: (...args: ARGS) => Promise<PROMISE_RESULT>,
    duration: DebounceDuration,
    options?: DebouncePromiseOptions,
  ): (...args: ARGS) => Promise<PROMISE_RESULT>;

}
