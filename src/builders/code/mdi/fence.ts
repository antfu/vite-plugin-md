import { pipe } from 'fp-ts/lib/function'
import type MarkdownIt from 'markdown-it'
import type { Pipeline, PipelineStage } from '../../../types'
import {
  convertBlocksToDomNodes,
  defaultBlocks,
  expandCodeBlockVariables,
  extractMarkdownItTokens,
  highlightLines,
  renderHtml,
  resolveLanguage,
  updateCodeBlockWrapper,
  updateLineNumbers,
  updatePreWrapper,
  useHighlighter, userRules,
} from '../pipeline'
import type {
  CodeOptions,
} from '../types'
import { trace } from '../utils'

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
        extractMarkdownItTokens(payload, state[idx]),
        defaultBlocks(options),
        resolveLanguage(options),

        userRules('before', payload, options),
        expandCodeBlockVariables(payload),
        useHighlighter(highlighter, options),

        convertBlocksToDomNodes(payload, options),
        
        updateCodeBlockWrapper(payload, options),
        updateLineNumbers(options),
        highlightLines(options),
        updatePreWrapper(payload),
        userRules('after', payload, options),

        renderHtml(payload, options),
      )

      return fence.html
    }
  }
}
