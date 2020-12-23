/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2018-11-30T16:46:03+01:00
 * @Copyright: Technology Studio
 **/
/* eslint-disable @typescript-eslint/promise-function-async */

import type {
  DebouncePromiseOptions,
  DeferredPromise,
  DebounceDuration,
} from '../Model/Types'

const is = <TYPE> (value: TYPE | null): TYPE => {
  if (value != null) {
    return value
  }
  throw Error('undefined or null value, should be present')
}

const getDuration = (duration: DebounceDuration): number => (
  typeof duration === 'function' ? duration() : duration
)

const createDeferredPromise = <PROMISE_RESULT>(): DeferredPromise<PROMISE_RESULT> => {
  const deferred: DeferredPromise<PROMISE_RESULT> = {} as DeferredPromise<PROMISE_RESULT>
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

export const debouncePromise = <PROMISE_RESULT, ARGS>(
  fn: (...args: ARGS[]) => Promise<PROMISE_RESULT>,
  duration: DebounceDuration,
  options?: DebouncePromiseOptions,
): (...args: ARGS[]) => Promise<PROMISE_RESULT> => {
  let lastCallTimestamp: number | null
  let deferredPromise: DeferredPromise<PROMISE_RESULT> | null
  let pendingPromise: Promise<PROMISE_RESULT> | null
  let timeoutId: NodeJS.Timeout | null
  let pendingArgs: ARGS[] | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function debounced (this: any, ...args: ARGS[]): Promise<PROMISE_RESULT> {
    const currentDuration = getDuration(duration)
    const currentCallTimestamp = new Date().getTime()

    const isReadyToCall = (
      !timeoutId &&
      !pendingPromise && (
        !lastCallTimestamp ||
        (currentCallTimestamp - lastCallTimestamp) > currentDuration
      )
    )
    // console.log('START', { isReadyToCall, pendingPromise, timeoutId, args, deferredPromise })
    if (isReadyToCall && options && options.immediate) {
      if (deferredPromise) {
        pendingArgs = args
        return flushDeferredPromise()
      }
      return finalizePromiseCall(fn.call(this, ...args))
    }

    pendingArgs = args

    if (deferredPromise) {
      if (options?.throwBouncedPromiseError) {
        deferredPromise.reject(new Error('bounced-call'))
        deferredPromise = createDeferredPromise()
      }
    } else {
      deferredPromise = createDeferredPromise()
    }
    if (!pendingPromise && !timeoutId) {
      timeoutId = setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        flushDeferredPromise.bind(this),
        Math.min(currentDuration, lastCallTimestamp ? currentCallTimestamp - lastCallTimestamp : currentDuration),
      )
    }

    return deferredPromise.promise

    function finalizePromiseCall (promise: Promise<PROMISE_RESULT>): Promise<PROMISE_RESULT> {
      lastCallTimestamp = new Date().getTime()
      pendingPromise = promise.finally(() => {
        pendingPromise = null
      }).then(data => {
        if (pendingArgs) {
          const thisPendingArgs = pendingArgs
          pendingArgs = null
          return debounced(...thisPendingArgs)
        }
        return Promise.resolve(data)
      })
      return pendingPromise
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function flushDeferredPromise (this: any): Promise<PROMISE_RESULT> {
      // console.log('FLUSH', { timeoutId, deferredPromise, pendingPromise, pendingArgs })
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      const thisDeferredPromise = is(deferredPromise)
      const thisPendingArgs = is(pendingArgs)
      pendingArgs = null
      deferredPromise = null

      const promise = fn.call(this, ...thisPendingArgs).then(
        (value) => {
          thisDeferredPromise.resolve(value)
          return value
        },
        (reason) => {
          thisDeferredPromise.reject(reason)
          return reason
        },
      )
      return finalizePromiseCall(promise)
    }
  }
}
