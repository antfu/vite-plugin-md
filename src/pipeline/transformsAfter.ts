import type { Pipeline, PipelineStage } from '../@types'

/**
 * Call's the transformer function provided in `options.after` before finishing
 */
export function transformsAfter(payload: Pipeline<PipelineStage.closeout>): Pipeline<PipelineStage.closeout> {
  const { options: { transforms: { after } } } = payload
  return after ? { ...payload, content: after(payload.component, payload.fileName) } : payload
}
