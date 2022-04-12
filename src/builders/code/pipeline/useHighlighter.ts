import type { CodeBlockMeta, CodeOptions, HighlighterFunction, LineClassFn } from '../types'
import { isLineCallback } from '../utils'

/**
 * Adds the class for a given line in the code block including
 * ensuring that user's `lineClass` option is consulted to set
 * this as user desires
 */
const klass = (o: CodeOptions, fence: CodeBlockMeta<'code'>): LineClassFn => {
  const { lineClass } = o
  const { code, lang } = fence
  return lineClass
    ? isLineCallback(lineClass)
      ? (line: string) => ['line', lineClass(line, code, lang)].join(' ')
      : typeof lineClass === 'string'
        ? (_: string) => lineClass
        : (_: string) => ''
    : (_: string) => 'line'
}

/**
 * Iterate, line-by-line, through the code block and use **Prism** or
 * **Shiki** to mutate the code block into stylized HTML.
 *
 * Note: each line is distinguished by a newline character in the source
 * Markdown, this newline is maintained but each line of code is wrapped with
 * `<span class=''></span>` and default classes are applied to this line.
 */
export const useHighlighter = (
  h: HighlighterFunction<any>,
  o: CodeOptions,
) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  return {
    ...fence,
    code: h(fence.code, fence.lang, klass(o, fence)),
  }
}
