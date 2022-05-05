// import { escapeHtml } from 'markdown-it/lib/common/utils'
import type { Lang } from 'shiki'
import type {
  CodeOptions,
  HighlighterFunction,
  LineClassFn,
  PrismOptions,
  ShikiOptions,
} from '../types'
import type { PrismLanguage } from '../utils'
import { usesPrismHighlighting } from '../utils/highlighting'
import { getPrismHighlighter } from './prism'
import { getShikiHighlighter } from './shiki'

const shiki = async (options: ShikiOptions): Promise<HighlighterFunction<Lang>> => {
  const api = await getShikiHighlighter(options)

  return (code: string, lang: Lang, klass: LineClassFn): string => {
    return api.highlight(code, lang, klass)
  }
}

const prism = (options: PrismOptions): HighlighterFunction<PrismLanguage> => {
  return (code: string, lang: PrismLanguage, klass: LineClassFn): string => {
    const highlight = getPrismHighlighter(options)
    return highlight(code, lang, klass)
  }
}

/**
 * Provides either **Prism** or **Shiki** as the _highlight_ function used for code
 * blocks.
 */
export const establishHighlighter = async (options: CodeOptions) =>
  usesPrismHighlighting(options)
    ? prism(options)
    : shiki(options)
