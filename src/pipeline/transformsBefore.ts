import type { Pipeline, PipelineStage } from '../@types'

/**
 * Call's the transformer function provided in `options.before`
 */
export function transformsBefore(payload: Pipeline<PipelineStage.initialize>): Pipeline<PipelineStage.initialize> {
  const { options: { transforms: { before } } } = payload
  return before ? { ...payload, content: before(payload.content, payload.fileName) } : payload
}
