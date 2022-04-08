import { transformer } from '../utils'

/**
 * Call's the transformer function provided in `options.before`
 */
export const transformsBefore = transformer('initialize', 'initialize', (p) => {
  const { content, fileName, options: { transforms: { before } } } = p
  return before
    ? ({ ...p, content: before(content, fileName) })
    : p
})
