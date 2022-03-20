import type { Pipeline, PipelineStage } from '../@types'

/**
 * Using the MarkdownIt parser we are able to extract raw HTML content
 */
export function parseHtml(payload: Pipeline<PipelineStage.parser>): Pipeline<PipelineStage.parsed> {
  const html = payload.parser.render(payload.md, {})
  return { ...payload, html, fencedLanguages: new Set<string>() }
}
