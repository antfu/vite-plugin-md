import { pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions, HighlighterFunction, LineClassFn } from '../types'
import { isLineCallback } from '../utils'

/**
 * Adds the class for a given line in the code block including
 * ensuring that user's `lineClass` option is consulted to set
 * this as user desires
 */
const klass = (generalClass: string, o: CodeOptions, fence: CodeBlockMeta<'code'>): LineClassFn => {
  const { lineClass } = o
  const { code, lang } = fence
  return lineClass
    ? isLineCallback(lineClass)
      ? (line: string) => [generalClass, lineClass(line, code, lang)].join(' ')
      : typeof lineClass === 'string'
        ? (_: string) => lineClass
        : (_: string) => ''
    : (_: string) => generalClass
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
    code: h(fence.code, fence.lang, klass('code-line', o, fence)),
    aboveTheFoldCode: fence.aboveTheFoldCode
      ? pipe(
        h(fence.aboveTheFoldCode, fence.lang, klass('line-above', o, fence)),
      )
      : undefined,
  }
}
