import type { DocumentFragment } from 'happy-dom'
import type Prism from 'prismjs'
import type { ILanguageRegistration, IThemeRegistration, Lang, Highlighter as ShikiHighlighter } from 'shiki'
import type { Pipeline, PipelineStage } from '../../../types'
import type { PrismLanguage } from '../utils'

export enum Highlighter {
  /** [Shiki Highlighter](https://shiki.matsu.io/) */
  shiki = 'shiki',
  /** [PrismJS Highlighter](https://prismjs.com/)  */
  prism = 'prism',
}

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
export type BlockCallback<T> = (fence: CodeBlockMeta<'code'>, filename: string, frontmatter: Pipeline<PipelineStage.parser>['frontmatter']) => T

export interface CommonOptions {
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
   * 1. if for some reason you want to _change_ the classname you may pass in a static string value
   * which will be used instead of "line".
   * 2. if you pass in a `LineCallback` function you will receive the code on that line along with the language and you can opt to _add_ additional classes (the "line" class will persist regardless of what you return)
   * 3. if you want _no classes_ then you can pass in a `false` value to indicate this
   */
  lineClass?: string | false | LineCallback

  /**
   * Any default classes to add to the header region (when region is found to exist)
   */
  headingClasses?: string[] | BlockCallback<string[]>
  /**
   * Any default classes to add to the footer region (when region is found to exist)
   */
  footerClasses?: string[] | BlockCallback<string[]>

  /**
   * Determines the default behavior for showing/hiding the line numbers in code blocks
   */
  lineNumbers: boolean

  /**
   * Flag indicating whether to display the language name in the upper right
   * of the code block.
   */
  showLanguage: boolean

  /**
   *
   */
  highlightLines: boolean
}

export interface PrismOptions extends CommonOptions {
  /**
   * The highlighter engine -- **Prism** or **Shiki** -- that will provide styling
   */
  engine: Highlighter.prism
  /** Prism plugins */
  plugins: string[]
  /**
   * Callback for Prism initialisation. Useful for initialising plugins.
   * @param prism The Prism instance that will be used by the plugin.
   */
  init: (prism: typeof Prism) => void
  /**
   * The language to use for code blocks that specify a language that Prism does not know.
   */
  defaultLanguageForUnknown?: PrismLanguage
  /**
   * The language to use for code blocks that do not specify a language.
   */
  defaultLanguageForUnspecified: PrismLanguage
  /**
   * Shorthand to set both {@code defaultLanguageForUnknown} and {@code defaultLanguageForUnspecified} to the same value. Will be copied
   * to each option if it is set to {@code undefined}.
   */
  defaultLanguage?: PrismLanguage
}

/**
 * Allows a user to register both a light and dark theme for
 * code blocks.
 */
export interface IDarkModeThemeRegistration {
  dark: IThemeRegistration
  light: IThemeRegistration
}

export interface ShikiOptions extends CommonOptions {
  /**
   * The highlighter engine -- **Prism** or **Shiki** -- that will provide styling
   */
  engine: Highlighter.shiki
  theme?: IThemeRegistration | IDarkModeThemeRegistration
  langs?: ILanguageRegistration[]
  highlighter?: ShikiHighlighter
}

export type CodeOptions = ShikiOptions | PrismOptions

/**
 * Modifiers are single character tokens which are allowed
 * to preceed the "language" in a fence statement to provide
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
   * using an asteriks modifier will force the line numbers
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

/**
 * When a fence block is encountered it will be parsed
 * into the following structure for evaluation.
 */
export interface CodeBlockMeta<S extends CodeParsingStage> {
  /**
   * The finalized HTML based on the code pipeline
   */
  html: S extends 'complete' ? string : never

  pre: S extends 'code' ? string : DocumentFragment
  lineNumbersWrapper: S extends 'code' ? string : DocumentFragment
  codeBlockWrapper: S extends 'code' ? string : DocumentFragment

  /**
   * The code block; represented as either a string or a DOM tree
   * based on lifecycle
   */
  code: S extends 'code' ? string : DocumentFragment

  /**
   * An optional heading to put above the code block
   */
  heading?: S extends 'code' ? string : DocumentFragment
  /**
   * An optional footer to put under the code block
   */
  footer?: S extends 'code' ? string : DocumentFragment

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
   * The identified language in the code block
   */
  lang: string
  /**
   * The properties found on the top line (to right of language and backticks), these
   * key/value pairs will be assigned to the
   */
  props: {
    /**
     * Indicates what lines to highlight, this can be:
     * - a single line number
     * - a line range
     * - a line with a give token block (TODO: figure out how to model)
     */
    highlight?: number | [from: number, to: number] | { kind?: TokenType; name: string }
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
  modifiers: Modifier[]
  /**
   * not sure how useful this is yet ... currently always evaluates to three
   * backticks
   */
  markup: string
}

export type LineClassFn = (line: string) => string

/**
 * A function which receives a code block's text, the language to
 * convert it to and returns the HTML which provides tokenized style
 * for the language.
 */
export type HighlighterFunction<T extends PrismLanguage | Lang> = (
  /** the code prior to being transformed */
  code: string,
  /** the language of the code */
  lang: T,
  /** a callback fn which returns the line's class string */
  lineClass: LineClassFn
) => string
