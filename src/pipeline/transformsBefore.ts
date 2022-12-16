import type { GenericBuilder } from '../types'
import { transformer } from '../utils'

/**
 * Call's the transformer function provided in `options.before`
 */
export const transformsBefore = <B extends readonly GenericBuilder[]>() => transformer<B>()(
  'initialize',
  (p) => {
    const { content, fileName, options: { transforms: { before } } } = p
    return before
      ? ({ ...p, content: before(content, fileName) })
      : p
  })
