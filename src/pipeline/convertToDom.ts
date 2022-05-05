import { createFragment } from 'happy-wrapper'
import { transformer } from '../utils'

export const convertToDom = transformer('convertToDom', 'parsed', 'dom', (payload) => {
  return {
    ...payload,
    html: createFragment(payload.html),
    fencedLanguages: new Set<string>(),
  }
})
