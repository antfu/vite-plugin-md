import type { CodeBlockMeta, CodeOptions } from '../types'

/**
 * provides initial defaults for the `pre`, `codeBlockWrapper`, and `lineNumbersWrapper`
 */
export const defaultBlocks = (_o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  const codeBlockWrapper = '<div class="code-block" />'
  const pre = '<pre />'
  const lineNumbersWrapper = '<div class="line-numbers-wrapper" />'

  return {
    ...fence,
    pre,
    codeBlockWrapper,
    lineNumbersWrapper,
  }
}
