/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-12-03T13:01:34+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

export type DebouncePromiseOptions = {
   immediate?: boolean,
   throwBouncedPromiseError?: boolean,
}

export type DeferredPromise<PROMISE_RESULT> = {
  promise: Promise<PROMISE_RESULT>,
  resolve: Function,
  reject: Function,
}

export type DebounceDuration = (() => number) | number
