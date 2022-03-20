import type { Pipeline, PipelineStage } from '../@types'

/**
 * if the user has configured the `markdownItSetup(fn)` property, then
 * the parser will be passed into this callback function so that the
 * parser may be configured.
 */
export function applyMarkdownItOptions(payload: Pipeline<PipelineStage.parser>): Pipeline<PipelineStage.parser> {
  payload.options.markdownItSetup(payload.parser)
  return payload
}
