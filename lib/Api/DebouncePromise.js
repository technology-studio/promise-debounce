/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-11-30T16:46:03+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

import type {
  DebouncePromiseOptions,
  DeferredPromise,
  DebounceDuration,
} from '../Model/Types'

// TODO: is extracted from internal library, replace later by @txo/flow
const is = <TYPE> (value: ?TYPE): TYPE => {
  if (value) {
    return value
  }
  throw Error('undefined value, should be present')
}

const getDuration = (duration: DebounceDuration): number => (
  typeof duration === 'function' ? duration() : duration
)

const createDeferredPromise = <DEFERED_PROMISE>(): DeferredPromise<DEFERED_PROMISE> => {
  const deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

export const debouncePromise = <PROMISE_RESULT>(
  fn: (...args: any) => Promise<PROMISE_RESULT>,
  duration: DebounceDuration,
  options?: DebouncePromiseOptions,
) => {
  let lastCallTimestamp: ?number
  let deferredPromise: ?DeferredPromise<PROMISE_RESULT>
  let pendingPromise: ?Promise<PROMISE_RESULT>
  let timeoutId: ?TimeoutID
  let pendingArgs

  return function debounced (...args: any) {
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
      if (options && options.throwBouncedPromiseError) {
        deferredPromise.reject(new Error('bounced-call'))
        deferredPromise = createDeferredPromise()
      }
    } else {
      deferredPromise = createDeferredPromise()
    }
    if (!pendingPromise && !timeoutId) {
      timeoutId = setTimeout(
        flushDeferredPromise.bind(this),
        Math.min(currentDuration, lastCallTimestamp ? currentCallTimestamp - lastCallTimestamp : currentDuration)
      )
    }

    return deferredPromise.promise

    function finalizePromiseCall (promise: Promise<PROMISE_RESULT>) {
      lastCallTimestamp = new Date().getTime()
      pendingPromise = promise.finally(() => {
        // console.log('FINALY')
        pendingPromise = null
        if (pendingArgs) {
          const thisPendingArgs = pendingArgs
          pendingArgs = null
          return debounced(...thisPendingArgs)
        }
      })
      return pendingPromise
    }

    function flushDeferredPromise () {
      // console.log('FLUSH', { timeoutId, deferredPromise, pendingPromise, pendingArgs })
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      const thisDeferredPromise = is(deferredPromise)
      const thisPendingArgs = is(pendingArgs)
      pendingArgs = null
      deferredPromise = null

      return finalizePromiseCall(
        fn.call(this, ...thisPendingArgs).then(thisDeferredPromise.resolve, thisDeferredPromise.reject)
      )
    }
  }
}
