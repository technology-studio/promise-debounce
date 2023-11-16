/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2018-12-03T13:01:34+01:00
 * @Copyright: Technology Studio
**/

export type DebouncePromiseOptions = {
  immediate?: boolean,
  throwBouncedPromiseError?: boolean,
}

export type DeferredPromise<PROMISE_RESULT> = {
  promise: Promise<PROMISE_RESULT>,
  resolve: (value: PROMISE_RESULT) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void,
}

export type DebounceDuration = (() => number) | number
