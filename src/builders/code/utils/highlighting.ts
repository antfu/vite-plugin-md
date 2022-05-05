import type { CodeBlockMeta, CodeOptions, LineCallback, PrismOptions, ShikiOptions } from '../types'
import { Highlighter } from '../types'
import { validPrismLanguage } from './prism-languages'

export function isValidLanguage(h: Highlighter, meta: CodeBlockMeta<'code'>): boolean {
  if (h === Highlighter.prism) {
    return validPrismLanguage(meta.lang)
  }
  else {
    // TODO: do for Shiki
    return true
  }
}

/** Type Guard to detect options hash for Prism */
export function usesPrismHighlighting(h: CodeOptions): h is PrismOptions {
  return h.engine === Highlighter.prism
}

/** Type Guard to detect options hash for Shiki */
export function usesShikiHighlighting(h: CodeOptions): h is ShikiOptions {
  return h.engine === Highlighter.shiki
}

export function isLineCallback(cb?: false | string | LineCallback): cb is LineCallback {
  return !!(cb && typeof cb === 'function')
}
