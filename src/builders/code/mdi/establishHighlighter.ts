import { escapeHtml } from 'markdown-it/lib/common/utils'
import type { Grammar } from 'prismjs'
import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index'
import type {
  CodeOptions,
  Highlighter,
  LineClassFn,
} from '../code-types'

function wrap(line: string, klass: LineClassFn) {
  return `<div class="${klass(line)}">${line}</div>`
}

/**
 * A dictionary of name value pairs used for looking up
 * language aliases.
 */
export const prismLanguageAliases: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  md: 'markdown',
  sh: 'shell-session',
  zsh: 'shell-session',
  bash: 'shell-session',
  ksh: 'shell-session',
  vue: 'handlebars',
  html: 'handlebars',
  ascii: 'asciidoc',
}

/**
 * Gets a proper Prism grammar based on language request, aliases,
 * and fallbacks
 */
export const getPrismGrammar = (lang: string | undefined, options: CodeOptions): {
  langUsed: string
  grammar: Grammar
} => {
  const bespoke = options.languageGrammars
  const candidate = lang || options.defaultLanguageForUnspecified

  if (candidate.toLowerCase() in prismLanguageAliases) {
    // alias was a match
    loadLanguages(prismLanguageAliases[candidate])
    return {
      langUsed: prismLanguageAliases[candidate],
      grammar: Prism.languages[prismLanguageAliases[candidate]],
    }
  }
  else if (Prism.languages[candidate]) {
    // language found as stated
    loadLanguages(candidate)
    return {
      langUsed: candidate,
      grammar: Prism.languages[candidate],
    }
  }
  else if (Prism.languages[candidate.toLowerCase()]) {
    // language found as stated (after conversion to lowercase)
    loadLanguages(candidate.toLowerCase())
    return {
      langUsed: candidate.toLowerCase(),
      grammar: Prism.languages[candidate.toLowerCase()],
    }
  }
  else if (bespoke && bespoke[candidate]) {
    // the plugin provided a bespoke Grammar for this choice
    Prism.languages[candidate] = bespoke[candidate]
    return { langUsed: candidate, grammar: bespoke[candidate] }
  }

  else {
    loadLanguages(candidate)
    if (!Prism.languages[candidate]) {
      // couldn't find the language so fall back to defaults
      const fallback = options.defaultLanguageForUnknown || options.defaultLanguage || 'markdown'
      loadLanguages(fallback)
      return {
        langUsed: fallback,
        grammar: Prism.languages[fallback],
      }
    }
    else {
      // language exists in Prism after load attempt
      return { langUsed: candidate, grammar: Prism.languages[candidate] }
    }
  }
  //
}

export const getPrismHighlighter = (options: CodeOptions): Highlighter =>
  /** Highlighter API  */
  (code: string, lang: string, klass: LineClassFn) => {
    const { grammar, langUsed } = getPrismGrammar(lang, options)

    if (!grammar)
      console.warn(`A code block starting with "${code.slice(0, 15)}" tried to parse the language "${lang}" which after evaluation was changed to "${langUsed}" but there was no grammar passed back to do the parsing! This probably needs attention!`)

    const highlight = Prism.highlight as (line: string, grammar: Grammar, lang: string) => string

    return [
      code
        .trimEnd()
        .split(/\r?\n/g)
        .map(line => grammar
          ? highlight(line, grammar, langUsed)
          : escapeHtml(line) as string,
        )
        .map(line => wrap(line, klass))
        .join('\n'),
      langUsed,
    ]
  }

/**
 * Was intended to use as an abstraction between different highlighters --
 * specifically Prism and Shiki -- but due to time constraints we are
 * currently only supporting Prism.
 *
 * For now, however, we are maintaining this abstraction.
 */
export const establishHighlighter = async (options: CodeOptions) =>
  getPrismHighlighter(options)

