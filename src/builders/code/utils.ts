
import type { CodeFenceMeta, CodeOptions, LineCallback, PrismOptions, ShikiOptions } from './types'
import { Highlighter } from './types'

export function isValidLanguage(h: Highlighter, _meta: CodeFenceMeta): boolean {
  if (h === Highlighter.prism) {
    //
  }
  else {
    //
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
