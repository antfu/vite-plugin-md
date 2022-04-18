import type { CodeBlockMeta, CodeOptions } from '../types'

/**
 * provides initial defaults for the `pre`, `codeBlockWrapper`, and `lineNumbersWrapper`
 */
export const defaultBlocks = (_o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  const heading = fence.props.heading
  
  const codeBlockWrapper = `<div class="code-wrapper"><div class="code-block"></div></div>`
  const pre = '<pre>\n</pre>\n'
  const lineNumbersWrapper = '<div class="line-numbers-wrapper"></div>\n'

  return {
    ...fence,
    pre,
    codeBlockWrapper,
    lineNumbersWrapper,
  }
}
