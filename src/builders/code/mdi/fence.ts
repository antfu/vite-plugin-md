import { pipe } from 'fp-ts/lib/function'
import type MarkdownIt from 'markdown-it'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeOptions } from '../code-types'
import {
  addClipboard,
  addLanguage,
  convertBlocksToDomNodes,
  defaultBlocks,
  expandCodeBlockVariables,
  extractMarkdownItTokens,
  highlightLines,
  inlineStyles,
  renderHtml,
  updateCodeBlockWrapper,
  updateFrontmatterWithCodeBlock,
  updateLineNumbers,
  updatePreWrapper,
  useHighlighter,
  userRules,
} from '../pipeline'
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
        defaultBlocks(payload, options),

        userRules('before', payload, options),
        expandCodeBlockVariables(payload),
        useHighlighter(payload, highlighter, options),

        convertBlocksToDomNodes(payload, options),

        updateCodeBlockWrapper(payload, options),
        updateLineNumbers(options),
        highlightLines(options),
        updatePreWrapper(payload),
        inlineStyles(payload, options),
        updateFrontmatterWithCodeBlock(payload, options),
        userRules('after', payload, options),

        addLanguage(options),
        addClipboard(payload, options),
        renderHtml(payload, options),
      )

      return fence.html
    }
  }
}
