/* eslint-disable @typescript-eslint/no-var-requires */
import type { Grammar } from 'prismjs'
import { escapeHtml } from 'markdown-it/lib/common/utils'
import type { LineClassFn, PrismOptions } from '../types'
import type { PrismLanguage } from '../utils'

function wrap(line: string, klass: LineClassFn) {
  return `<span class="${klass(line)}">${line}</span>`
}

export function getPrismHighlighter(options: PrismOptions) {
  const Prism = require('prismjs')

  options.plugins.forEach(loadPrismPlugin)
  options.init(Prism)

  return (code: string, lang: PrismLanguage, klass: LineClassFn): string => {
    if (!Prism.languages[lang]) {
      const loadLanguages = require('prismjs/components/')
      loadLanguages([lang])
    }
    const grammar: Grammar | undefined = Prism.languages[lang]
    const highlight = Prism.highlight as (line: string, grammar: Grammar, lang: string) => string

    return code
      .trimEnd()
      .split(/\r?\n/g)
      .map(line => grammar
        ? highlight(line, grammar, lang as string)
        : escapeHtml(line) as string,
      )
      .map(line => wrap(line, klass))
      .join('\n')
  }
}

/**
 * Loads the provided Prism plugin.
 * @param name Name of the plugin to load
 * @throws {Error} If there is no plugin with the provided {@code name}
 */
export function loadPrismPlugin(name: string): void {
  try {
    require(`prismjs/plugins/${name}/prism-${name}`)
  }
  catch (e) {
    throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`)
  }
}

/**
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param options
 *        The options that were used to initialize the plugin.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return  The name of the language to use and the Prism language object for that language.
 */
export function getPrismGrammar(Prism: typeof Prism, lang: string): Grammar | undefined {
  return loadPrismLang(lang)
}
