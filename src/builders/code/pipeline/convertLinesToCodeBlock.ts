import { pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta } from '../types'
import { getHtmlFromCodeLines, getHtmlFromNode, wrapCodeBlock } from '../utils'

/**
 * Converts the lines of DOM elements back to a singular HTML string which
 * represents the `code` block
 */
export function convertLinesToCodeBlock(fence: CodeBlockMeta<'lines'>): CodeBlockMeta<'complete'> {
  const code = fence.wrapLines
    ? pipe(
      fence.lines,
      wrapCodeBlock(fence.wrapLines),
      getHtmlFromNode,
    )
    : getHtmlFromCodeLines(fence.lines)

  return {
    ...fence,
    code,
  }
}
