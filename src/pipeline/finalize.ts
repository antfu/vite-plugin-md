import { transformer, wrap } from '../utils'

/**
 * Wraps up all the content section into the final Vue SFC component syntax and then
 * provides this to the `options.transforms.after` callback if provided.
 */
export const finalize = transformer('finalize', 'sfcBlocksExtracted', 'closeout', (payload) => {
  const { options: { transforms: { after } } } = payload

  const component = `${wrap('template', payload.templateBlock)}\n${payload.scriptBlock}\n${payload.customBlocks.join('\n')}`

  return {
    ...payload,
    component: after
      ? after(component, payload.fileName)
      : component,
  }
})
