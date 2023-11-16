/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2019-12-23T20:12:40+01:00
 * @Copyright: Technology Studio
**/

import { debouncePromise } from '@txo/debounce-promise'

const TIMEOUT = 50
const asyncFuncFactory = (timeout: number) => async (value: number): Promise<number> => await new Promise<number>((resolve, reject) => {
  setTimeout(() => {
    expect(value).toBe(value)
    resolve(value)
  }, timeout)
})
test('shoud pass', async () => {
  const asyncFunc = debouncePromise(asyncFuncFactory(TIMEOUT), TIMEOUT, { immediate: false })
  expect.assertions(4)
  await Promise.all([
    asyncFunc(1),
    asyncFunc(2),
    asyncFunc(3),
  ]).then(([result1, result2, result3]) => {
    expect(result1).toBe(3)
    expect(result2).toBe(3)
    expect(result3).toBe(3)
  })
})

test('shoud pass 2', async () => {
  const asyncFunc = debouncePromise(asyncFuncFactory(TIMEOUT), TIMEOUT, { immediate: true })
  expect.assertions(5)
  await Promise.all([
    asyncFunc(1),
    asyncFunc(2),
    asyncFunc(3),
  ]).then(([result1, result2, result3]) => {
    expect(result1).toBe(3)
    expect(result2).toBe(3)
    expect(result3).toBe(3)
  })
})
