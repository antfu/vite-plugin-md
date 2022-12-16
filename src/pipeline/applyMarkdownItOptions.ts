import type { GenericBuilder } from '../types/core'
import { transformer } from '../utils'

/**
 * if the user has configured the `markdownItSetup(fn)` property, then
 * the parser will be passed into this callback function so that the
 * parser may be configured.
 */
export const applyMarkdownItOptions = <B extends readonly GenericBuilder[]>() => transformer<B>()('parser', (payload) => {
  payload.options.markdownItSetup(payload.parser)
  return payload
})
