import type { CodeBlockMeta } from '../types'
import { select, wrap } from '../utils'

/**
 * Updates the code block for better formatting. This makes easier to view
 * in browser's "view source" but also nested code blocks depend on having
 * appropriate indentation in some edge cases.
 */
export const updateCodeWrapper = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  const lines = select(fence.code).all('.line')
  lines.forEach(wrap('\n', '\n', fence.level + 2))

  return fence
}
