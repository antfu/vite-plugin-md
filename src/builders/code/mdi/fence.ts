import { pipe } from 'fp-ts/lib/function'
import type MarkdownIt from 'markdown-it'
import type { Pipeline, PipelineStage } from '../../../types'
import {
  convertBlocksToDomNodes,
  defaultBlocks,
  extractMarkdownItTokens,
  highlightLines,
  renderHtml,
  resolveLanguage,
  updateCodeBlockWrapper,
  updateCodeWrapper,
  updateLineNumbers,
  updatePreWrapper,
  useHighlighter, userRules,
} from '../pipeline'
import type {
  CodeOptions,
} from '../types'

import { establishHighlighter } from './establishHighlighter'

/**
 * A higher-order function which receives payload and options for context up front
 * and then can be added as Markdown plugin using the standard `.use()` method.
 */
export const fence = async (payload: Pipeline<PipelineStage.parser>, options: CodeOptions) => {
  const highlighter = await establishHighlighter(options)

  // return a Markdown-IT plugin
  return (
    md: MarkdownIt,
  ) => {
    md.renderer.rules.fence = (state, idx) => {
      // fence mutation pipeline
      const fence = pipe(
        extractMarkdownItTokens(state[idx]),
        defaultBlocks(options),
        resolveLanguage(options),

        userRules('before', payload, options),
        useHighlighter(highlighter, options),

        convertBlocksToDomNodes(payload, options),

        updateCodeBlockWrapper(options),
        updateLineNumbers(options),
        highlightLines(options),
        updateCodeWrapper,
        updatePreWrapper,
        userRules('after', payload, options),

        renderHtml,
      )

      return fence.html
    }
  }
}
