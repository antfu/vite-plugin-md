import { toArray } from '@antfu/utils'
import type { Pipeline, PipelineStage } from '../@types'

/**
 * iterate over each plugin which was supplied in this plugin's
 * `markdownItUses` option and add it to the parser
 */
export function loadMarkdownItPlugins(payload: Pipeline<PipelineStage.parser>): Pipeline<PipelineStage.parser> {
  payload.options.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)
    payload.parser.use(plugin, options)
  })

  return payload
}
