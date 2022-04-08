import { transformer, wrap } from '../utils'

/**
 * Wraps the different SFC blocks into a single string as the `component` property
 * and thereby completes the _payload_ of this pipeline
 */
export const finalize = transformer('finalize', 'sfcBlocksExtracted', 'closeout', payload => ({
  ...payload,
  component: `${wrap('template', payload.templateBlock)}\n${payload.scriptBlock}\n${payload.customBlocks.join('\n')}`,
}))
