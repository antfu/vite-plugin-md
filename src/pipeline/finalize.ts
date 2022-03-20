import type { Pipeline, PipelineStage } from '../@types'
import { wrap } from '../utils'

/**
 * Wraps the different SFC blocks into a single string as the `component` property
 * and thereby completes the _payload_ of this pipeline
 */
export function finalize(payload: Pipeline<PipelineStage.sfcBlocksExtracted>): Pipeline<PipelineStage.closeout> {
  return {
    ...payload,
    component: `${wrap('template', payload.templateBlock)}\n${payload.scriptBlock}\n${payload.customBlocks.join('\n')}`,
  }
}
