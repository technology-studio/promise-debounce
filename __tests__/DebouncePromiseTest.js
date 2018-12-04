/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-12-03T19:22:11+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

import { debouncePromise } from '../lib'

const SAMPLE_VALUE_1 = 'sample1'
const SAMPLE_VALUE_2 = 'sample2'
const SAMPLE_VALUE_3 = 'sample3'
const INTERNAL_100 = 100
const DEBOUNCE_100 = 100
const INTERNAL_50 = 50

const sleep = (duration: number) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

describe('debounce promise', () => {
  var internal = jest.fn(value => value)

  const operationFactory = (internalDuration: number, debounceDuration: number, options) => (
    debouncePromise(value => {
      // console.log('START OP', value)
      return sleep(internalDuration).then(() => {
        // console.log('FINISH OP', value)
        return internal(value)
      })
    }, debounceDuration, options)
  )

  afterEach(() => {
    internal.mockClear()
  })

  describe('with delayed', () => {
    test('returns the result of a single call', async () => {
      const operation = operationFactory(INTERNAL_100, DEBOUNCE_100)
      await expect(operation(SAMPLE_VALUE_1)).resolves.toBe(SAMPLE_VALUE_1)
      expect(internal).toHaveBeenCalledTimes(1)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_1)
    })

    test('should postpone the result of first two calls for 3 subsequent call', async () => {
      const operation = operationFactory(INTERNAL_100, DEBOUNCE_100)
      const promises = [SAMPLE_VALUE_1, SAMPLE_VALUE_2, SAMPLE_VALUE_3].map(value => operation(value))
      const results = await Promise.all(promises)
      // console.log(results)
      // console.log(internal.mock.calls)
      expect(internal).toHaveBeenCalledTimes(1)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_3)
      expect(results).toEqual([SAMPLE_VALUE_3, SAMPLE_VALUE_3, SAMPLE_VALUE_3])
    })
  })

  describe('with immediate', () => {
    test('returns the result of a single call', async () => {
      const operation = operationFactory(INTERNAL_100, DEBOUNCE_100, { immediate: true })
      await expect(operation(SAMPLE_VALUE_1)).resolves.toBe(SAMPLE_VALUE_1)
      expect(internal).toHaveBeenCalledTimes(1)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_1)
    })

    test('should postpone second call for 2 subsequent call', async () => {
      const operation = operationFactory(INTERNAL_100, DEBOUNCE_100, { immediate: true })
      const promises = [SAMPLE_VALUE_1, SAMPLE_VALUE_2].map(value => operation(value))
      const results = await Promise.all(promises)
      // console.log(results)
      // console.log(internal.mock.calls)
      expect(internal).toHaveBeenCalledTimes(2)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_1)
      expect(internal).toHaveBeenNthCalledWith(2, SAMPLE_VALUE_2)
      expect(results).toEqual([SAMPLE_VALUE_1, SAMPLE_VALUE_2])
    })

    test('should result second call with result of the 3rd call for 3 subsequent call', async () => {
      const operation = operationFactory(INTERNAL_100, DEBOUNCE_100, { immediate: true })
      const promises = [SAMPLE_VALUE_1, SAMPLE_VALUE_2, SAMPLE_VALUE_3].map(value => operation(value))
      const results = await Promise.all(promises)
      // console.log(results)
      // console.log(internal.mock.calls)
      expect(internal).toHaveBeenCalledTimes(2)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_1)
      expect(internal).toHaveBeenNthCalledWith(2, SAMPLE_VALUE_3)
      expect(results).toEqual([SAMPLE_VALUE_1, SAMPLE_VALUE_3, SAMPLE_VALUE_3])
    })

    test('should result second call with result of the 3rd call for 3 not subsequent call', async () => {
      const operation = operationFactory(INTERNAL_50, DEBOUNCE_100, { immediate: true })
      const promises = [SAMPLE_VALUE_1, SAMPLE_VALUE_2, SAMPLE_VALUE_3].map(value => operation(value))
      const results = await Promise.all(promises)
      // console.log(results)
      // console.log(internal.mock.calls)
      expect(internal).toHaveBeenCalledTimes(2)
      expect(internal).toHaveBeenNthCalledWith(1, SAMPLE_VALUE_1)
      expect(internal).toHaveBeenNthCalledWith(2, SAMPLE_VALUE_3)
      expect(results).toEqual([SAMPLE_VALUE_1, SAMPLE_VALUE_3, SAMPLE_VALUE_3])
    })
  })
})
