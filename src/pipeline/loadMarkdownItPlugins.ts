import { toArray } from '@antfu/utils'
import type { Pipeline, PipelineStage } from '../types'
import { transformer } from '../utils'

/**
 * iterate over each plugin which was supplied in this plugin's
 * `markdownItUses` option and add it to the parser
 */
export const loadMarkdownItPlugins = transformer('parser', 'parser', (payload) => {
  payload.options.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)
    payload.parser.use(plugin, options)
  })

  return payload
})
