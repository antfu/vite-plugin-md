import MarkdownIt from 'markdown-it'
import type { Pipeline, PipelineStage } from '../@types'

/**
 * Creates a **MarkdownIt** parser instance which this plugin will use for all processing.
 */
export function createParser(payload: Pipeline<PipelineStage.metaExtracted>): Pipeline<PipelineStage.parser> {
  const parser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...(payload.options?.markdownItOptions ? payload.options.markdownItOptions : {}),
  })

  parser.linkify.set({ fuzzyLink: false })

  return { ...payload, parser }
}
