import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions, Highlighter, LineCallback, LineClassFn } from '../code-types'

export function isLineCallback(cb?: false | string | LineCallback): cb is LineCallback {
  return !!(cb && typeof cb === 'function')
}

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
 * Get a _highlighter_ from the underlying library (PrismJS currently)
 * and parse each line of code into tokenized span's.
 *
 * Note: this library will try to load requested language but if not
 * will use aliases and fallbacks. The _actual_ language used will be
 * stored as `lang` on payload.
 */
export const useHighlighter = (
  p: Pipeline<PipelineStage.parser>,
  h: Highlighter,
  o: CodeOptions,
) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  const requestedLang = fence.lang
  const [code, lang] = h(fence.code, requestedLang, klass('code-line', o, fence))
  const [aboveTheFoldCode] = fence.aboveTheFoldCode
    ? h(fence.aboveTheFoldCode, requestedLang, klass('line-above', o, fence))
    : [undefined]

  p.codeBlockLanguages.langsRequested.push(requestedLang)
  p.codeBlockLanguages.langsUsed.push(lang)

  return {
    ...fence,
    lang,
    requestedLang,
    code,
    aboveTheFoldCode,
  }
}
