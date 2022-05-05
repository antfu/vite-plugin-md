import type { CodeBlockMeta, CodeOptions } from '../types'
import { isValidLanguage, prismTranslateAliases, usesPrismHighlighting } from '../utils'

/**
 * Looks for invalid and non-existant language settings and uses fallbacks
 * where available
 */
export const resolveLanguage = (o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  if (o.engine === 'prism')
    fence = { ...fence, requestedLang: fence.lang, lang: prismTranslateAliases(fence.lang) }

  if (fence.lang) {
    if (!isValidLanguage(o.engine, fence)) {
      fence.lang = usesPrismHighlighting(o)
        ? (o.defaultLanguageForUnknown || o.defaultLanguage || '') as string
        : fence.lang as string
    }
  }

  if (!fence.lang) {
    fence.lang = usesPrismHighlighting(o)
      ? (o.defaultLanguageForUnspecified || o.defaultLanguage) as string
      : fence.lang
  }

  return fence
}
