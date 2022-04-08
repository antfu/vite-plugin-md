import { transformer } from '../utils'

/**
 * Call's the transformer function provided in `options.after` before finishing
 */
export const transformsAfter = transformer('transformsAfter', 'closeout', 'closeout', (payload) => {
  const { options: { transforms: { after } } } = payload
  return after
    ? { ...payload, content: after(payload.component, payload.fileName) }
    : payload
})
