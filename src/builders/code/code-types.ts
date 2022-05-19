import type { Fragment } from 'happy-wrapper'
import type { Grammar } from 'prismjs'
import type { Pipeline, PipelineStage } from '../../types'
import type { CodeColorTheme } from './styles/color/color-types'

export type HTML = string

/**
 * A callback called for each line of a code block and responsible
 * for stating any _additional_ classes to add for this given line
 */
export type LineCallback = (
  /** the code, _only_ for the given line */
  line: string,
  /** the full code block */
  code: string,
  /** the language being converted to */
  lang: string
) => string

/**
 * A callback for a block node which provides build-time capability to
 * modify a property with a callback
 */
export type BlockCallback<T> = <S extends CodeParsingStage>(fence: CodeBlockMeta<S>, filename: string, frontmatter: Pipeline<PipelineStage.parser>['frontmatter']) => T

export interface CodeOptions {
  /**
   * The language to use for code blocks that specify a language that Prism does not know.
   *
   * @default 'plain'
   */
  defaultLanguageForUnknown?: string
  /**
   * The language to use for code blocks that do not specify a language.
   *
   * @default 'plain'
   */
  defaultLanguageForUnspecified: string
  /**
   * Shorthand to set both {@code defaultLanguageForUnknown} and {@code defaultLanguageForUnspecified} to the same value. Will be copied
   * to each option if it is set to {@code undefined}.
   */
  defaultLanguage?: string
  /**
   * Hook into the fence mutation process _before_ the builder
   * gets involved.
   */
  before: (fence: CodeBlockMeta<'code'>, payload: Pipeline<PipelineStage.parser>, options: CodeOptions) => CodeBlockMeta<'code'>
  /**
   * Hook into the fence mutation process _after_ the builder
   * has mutated CodeFenceMeta to it's configured rules.
   */
  after: (fence: CodeBlockMeta<'dom'>, payload: Pipeline<PipelineStage.parser>, options: CodeOptions) => CodeBlockMeta<'dom'>

  /**
   * By default each _line_ in the code will be given a class of "line" but you can override this
   * default behavior in one of the following ways:
   *
   * 1. if for some reason you want to _change_ the class name you may pass in a static string value
   * which will be used instead of "line".
   * 2. if you pass in a `LineCallback` function you will receive the code on that line along with the language and you can opt to _add_ additional classes (the "line" class will persist regardless of what you return)
   * 3. if you want _no classes_ then you can pass in a `false` value to indicate this
   */
  lineClass?: string | false | LineCallback

  /**
   * The vuepress/vitepress implementation of code blocks appears to use an interesting
   * DOM structure to bring in line numbers that didn't feel naturally intuitive (but may
   * have been done for very good reason). If you wish to use this structure you can configure
   * to use the `flex-lines` style.
   *
   * By default we use the 'tabular' layout which feels more intuitive and has full testing
   * behind it (in this repo).
   *
   * @default 'tabular'
   */
  layoutStructure: 'flex-lines' | 'tabular'

  /**
   * Any default classes to add to the header region (when region is found to exist);
   * if you override this be aware that some styling may expect the default "heading" class
   * to exist.
   *
   * @default 'heading'
   */
  headingClasses?: string[] | BlockCallback<string[]>

  /**
   * Any default classes to add to the footer region (when region is found to exist);
   * if you override this be aware that some styling may expect the default "footer" class
   * to exist.
   *
   * @default 'footer'
   */
  footerClasses?: string[] | BlockCallback<string[]>

  /**
   * Allows to turn on/off the feature of highlighting lines in code; this is just a "default"
   * as individual code blocks can explicitly ask for line numbers with the `#` modifier
   *
   * @default false
   */
  lineNumbers: boolean

  /**
   * Flag indicating whether to display the language name in the upper right
   * of the code block.
   *
   * @default true
   */
  showLanguage: boolean | BlockCallback<boolean>

  /**
   * Allows to turn on/off the feature of _highlighting_ lines in code; lines will never
   * be highlighted unless the page has instructions to highlight particular lines but
   * this allows all highlights to be explicitly turned off
   *
   * @default true
   */
  highlightLines: boolean | BlockCallback<boolean>

  /**
   * Adds a clipboard icon to the header row and injects the functionality to
   * copy code block contents to the clipboard.
   *
   * @default false
   */
  clipboard: boolean | BlockCallback<boolean>

  /**
   * The `copyToClipboard()` and `clipboardAvailable()` functions are automatically
   * added to pages which have a code block on the page which requests this functionality
   * but you can also just ask for it to be included in call pages so you can use these
   * functions for your own evil plans.
   */
  provideClipboardFunctionality: boolean | BlockCallback<boolean>

  theme?: 'base' | 'solarizedLight' | 'material' | 'dracula' | 'tomorrow' | 'duotone' | CodeColorTheme<any>

  /**
   * By default light mode has code blocks with light backgrounds, and dark mode with
   * dark backgrounds. If you want to _invert_ that you can by setting this property to
   * true.
   *
   * @default false
   */
  invertColorMode?: boolean

  /**
   * Should you want to add your own language grammar you can:
   * [Extending Prism Language Definitions](https://prismjs.com/extending.html#language-definitions)
   */
  languageGrammars?: Record<string, Grammar>

  /**
   * Code blocks will default to the following inline style:
   * ```css
   * .code-block {
   *    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
   * }
   * ```
   *
   * but you can override this inline style if you wish. Obviously you can also just
   * target the `.code-block` class to whatever you like
   */
  codeFont?: string
}

/**
 * Modifiers are single character tokens which are allowed
 * to precede the "language" in a fence statement to provide
 * some binary instruction to how to handle the code block.
 */
export enum Modifier {
  /**
   * the pound symbol is used to indicate that line numbers
   * for a code block should _always_ be used regardless of
   * the option set
   */
  '#' = '#',
  /**
   * using an asterisk modifier will force the line numbers
   * of a code block to NOT be used regardless of configuration
   */
  '*' = '*',
  /**
   * the exclamation modifier indicates that a code block should
   * _toggle_ the normal configuration for escape code interpolation
   */
  '!' = '!',
}

export type TokenType = 'keyword' | 'operator' | 'punctuation' | 'interpolation-punctuation' | 'builtin' | 'template-punctuation' | 'punctuation' | 'string'

export type CodeParsingStage = 'code' | 'dom' | 'complete'

export type HighlightKind = 'range' | 'line' | 'symbol'

export interface HighlightLine {
  kind: 'line'
  line: number
}
export interface HighlightRange {
  kind: 'range'
  from: number
  to: number
}
export interface HighlightSymbol {
  kind: 'symbol'
  symbol: string
}

/**
 * Tokens representing intent to highlight code; originating from any source
 * [highlight prop, csv, VuePress/Vitepress syntax]
 */
export type HighlightToken = HighlightLine | HighlightRange | HighlightSymbol

export type RangeExpression = `${string}-${string}`
/** the ways in which the user might express the "highlight" property */
export type HighlightExpression = number | RangeExpression | { symbol: string } | { from: number; to: number }

export interface CodeBlockProperties {
  /**
   * Indicates what lines to highlight, this can be:
   * - a single line number
   * - a line range
   * - a line with a give token block (TODO: figure out how to model)
   */
  highlight?: HighlightExpression | HighlightExpression[]
  /**
   * Allows pointing to an external file as the code source
   */
  filename?: string

  /** classes to add to the heading section */
  heading?: string
  /** classes to add to the footer section */
  footer?: string

  /** classes to add to the codeblock section */
  class?: string
  /** style properties to add to the codeblock section */
  style?: string
  width?: number | string
  height?: number | string
  alt?: string
  tooltip?: any
  'data-codeLines'?: number

  [key: string]: any
}

export type CodeFilename = boolean | 'filename' | 'with-path' | `name:${string}`

/**
 * When a fence block is encountered it will be parsed
 * into the following structure for evaluation.
 */
export interface CodeBlockMeta<S extends CodeParsingStage> {
  /**
   * The finalized HTML based on the code pipeline
   */
  html: S extends 'complete' ? string : never

  pre: S extends 'code' ? string : Fragment
  lineNumbersWrapper: S extends 'code' ? string : Fragment
  codeBlockWrapper: S extends 'code' ? string : Fragment

  /**
   * All highlighting information will be captured as
   * an array of `HighlightToken` tokens.
   */
  highlightTokens: HighlightToken[]

  /**
   * The external filename which the code block is importing (`null` if code is
   * not external).
   */
  externalFile: string | null

  /**
   * Specifies whether the filename should be displayed above the code block.
   * With _external code references_ the boolean turns this on/off and when
   * "on" it displays just the filename. You may also be more explicit by using
   * the `filename` or `with-path` string literals.
   *
   * Finally, should you want to explicitly state a filename -- useful for
   * non-external code -- you can put in a string value prefixed with `name:`.
   * If you are using an external file, this will override the actual file name.
   */
  showFilename: CodeFilename

  /**
   * Typically not used but when a code block references an external file
   * AND the local code block _also_ has code, then it will be placed here
   */
  aboveTheFoldCode?: S extends 'code' ? string : Fragment

  /**
   * The code block; represented as either a string or a DOM tree
   * based on lifecycle
   */
  code: S extends 'code' ? string : Fragment

  /**
   * An optional heading to put above the code block
   */
  heading?: S extends 'code' ? string : Fragment
  /**
   * An optional footer to put under the code block
   */
  footer?: S extends 'code' ? string : Fragment

  /**
   * The number of lines in the code block
   */
  codeLinesCount: S extends 'code' ? never : number

  /**
   * The tagName for the block; will be `code` except for edge cases
   */
  tag: string

  /**
   * The nesting level
   */
  level: number
  /**
   * The language used by the highlighter
   */
  lang: string

  /** The originally requested language by user */
  requestedLang: string

  /**
   * An optional message that a pipeline function can export and will
   * be picked up by trace() utility
   */
  trace?: string
  /**
   * The properties found on the top line (to right of language and back ticks), these
   * key/value pairs will be assigned to the
   */
  props: CodeBlockProperties
  modifiers: Modifier[]
  /**
   * not sure how useful this is yet ... currently always evaluates to three
   * back ticks
   */
  markup: string
}

export type LineClassFn = (line: string) => string

/**
 * A _highlighter_ API which is implementation neutral.
 */
export type Highlighter = (
  /** the code prior to being transformed */
  code: string,
  /** the language of the code */
  lang: string,
  /** a callback fn which returns the line's class string */
  lineClass: LineClassFn
) => [code: string, langUsed: string]
