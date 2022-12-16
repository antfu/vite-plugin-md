import type { GenericBuilder, Pipeline } from '../types'
import { transformer, wrap } from '../utils'

/**
 * Wraps up all the content section into the final Vue SFC component syntax and then
 * provides this to the `options.transforms.after` callback if provided.
 */
export const finalize = <B extends readonly GenericBuilder[]>() => transformer<B>()(
  'sfcBlocksExtracted',
  (payload) => {
    const { options: { transforms: { after } } } = payload

    const component = `${payload.scriptSetup}${payload.scriptBlocks.join('\n')}${payload.styleBlocks.join('\n')}${payload.customBlocks.join('\n')}${wrap('template', payload.templateBlock)}\n`

    return {
      ...payload,
      stage: 'closeout',
      component: after
        ? after(component, payload.fileName)
        : component,
    }
  })
