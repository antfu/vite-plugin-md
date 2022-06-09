import { keys } from './index'

export function createFnWithProps<F extends Function, P extends {}>(fn: F, props: P) {
  return (() => {
    const combined: any = fn
    for (const prop of keys(props))
      combined[prop] = props[prop]

    return combined
  })() as unknown as F & P
}
