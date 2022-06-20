import type { ReturnValues } from '../types'

export const valueOrCallback = <
    A extends any[],
    I extends ReturnValues | ((...args: A) => ReturnValues),
>(value: I, args: I extends Function ? A : never = undefined as never) => {
  return (
    typeof value === 'function'
      ? value(...args)
      : value
  ) as I
}
