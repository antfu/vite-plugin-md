import { pipe } from 'fp-ts/lib/function'
import type MarkdownIt from 'markdown-it'
import type { Pipeline, PipelineStage } from '../../../types'
import {
  convertLinesToCodeBlock,
  extractInfo,
  highlightLines,
  parseLines,
  renderFence,
  resolveLanguage,
  showLineNumbers,
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
export const fence = async(payload: Pipeline<PipelineStage.parser>, options: CodeOptions) => {
  const highlighter = await establishHighlighter(options)

  // return a Markdown-IT plugin
  return (
    md: MarkdownIt,
  ) => {
    md.renderer.rules.fence = (state, idx) => {
      // fence mutation pipeline
      const fence = pipe(
        extractInfo(state[idx]),
        userRules('before', payload, options),
        resolveLanguage(options),
        useHighlighter(highlighter, options),
        // the 'code' property is converted from a string to a DOM tree
        parseLines,
        highlightLines(options),
        showLineNumbers(options),
        userRules('after', payload, options),
        // the 'code' property is converted back to a string
        convertLinesToCodeBlock,
        renderFence,
      )

      return fence
    }
  }
}
