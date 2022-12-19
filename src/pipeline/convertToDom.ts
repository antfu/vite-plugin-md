import { createFragment } from '@yankeeinlondon/happy-wrapper'

import { transformer } from '../utils'

export const convertToDom = <B extends readonly any[]>() => transformer<B>()('parsed', (payload) => {
  return {
    ...payload,
    stage: 'dom',
    html: createFragment(payload.html),
    fencedLanguages: new Set<string>(),
  }
})
