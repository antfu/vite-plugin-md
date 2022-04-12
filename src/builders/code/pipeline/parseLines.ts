import type { CodeBlockMeta } from '../types'
import { getCodeLines } from '../utils'

/**
 * converts the string-based `code` property to `lines` which provide the
 * code block on a per-line basis as well as offering each line as
 * a DOM node (via Happy Dom)
 */
export function parseLines(fence: CodeBlockMeta<'code'>): CodeBlockMeta<'lines'> {
  const lines = getCodeLines(fence.code)

  const newFence: any = {
    ...fence,
    lines,
    'codeLineCount': lines.length,
    'data-codeLines': lines.length,
  }
  delete newFence.code
  return newFence
}
