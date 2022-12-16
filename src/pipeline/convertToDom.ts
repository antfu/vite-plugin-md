import { createFragment } from '@yankeeinlondon/happy-wrapper'
import type { GenericBuilder } from '../types/core'
import { transformer } from '../utils'

export const convertToDom = <B extends readonly GenericBuilder[]>() => transformer<B>()('parsed', (payload) => {
  return {
    ...payload,
    stage: 'dom',
    html: createFragment(payload.html),
    fencedLanguages: new Set<string>(),
  }
})
