export type ColorByMode = [light: Color, dark: Color]

/**
 * Coloration/Theming of a code block
 */
export interface CodeColorTheme<T extends Color | ColorByMode> {
  foreground: T
  background: T

  /** the background color for text selection */
  textSelectionBackground?: T

  /**
   * used in some grammars like SCSS where you might have `@apply`
   * but will same color as
   */
  atrule?: T

  keyword: T
  attribute?: T

  deleted?: T
  inserted?: T

  url?: T

  function?: T
  functionName?: T
  class?: T
  className?: T

  builtin: T
  tag?: T

  comment: T
  blockComment?: T
  doctype?: T
  cdata?: T
  prolog?: T

  pseudoElement?: T
  pseudoClass?: T

  property?: T
  /** will use same as "property" if not expressed separately */
  constant?: T
  /** will use same as "property" if not expressed separately */
  variable?: T

  /** string values */
  string: T
  /** literal value; will use string if not specified */
  literal?: T
  /** uses the same as "string" by default */
  char?: T

  /** a boolean value; uses `builtin` if not specified */
  boolean?: T
  /** uses `builtin` if not specified */
  selector?: T
  /** uses `builtin` if not specified */
  important?: T
  /** uses `builtin` if not specified */
  delimiter?: T

  /** any language symbol not otherwise matched, will use keyword if not stated */
  symbol?: T
  /** will use "symbol" if not defined */
  entity?: T
  /** numeric values; will use symbol if not expressed separately  */
  number?: T

  namespace?: T

  /**
   * A form of recognized punctuation in the code
   */
  punctuation?: T

  punctuationFirstChild?: T

  /** will use same as "punctuation" if not expressed separately */
  operator?: T
  /** will use same as "punctuation" if not expressed separately */
  attrName?: T

  attrValue?: T
  attrValueForPunctuation?: T
  attrValueForPunctuationFirstChild?: T

  decorator?: T
  regex: T
  hexcode?: T
  unit?: T

  id?: T

  jsonProperty?: T

  /** .language-markup .token.tag */
  markupTag?: T
  /** .language-markup .token.attr-name */
  markupAttrName?: T
  /** .language-markup .token.punctuation  */
  markupPunctuation?: T

  headingText?: T
  footerText?: T

  lineHighlightBackground?: T

  /**
   * the text color for a highlighted line
   * ```css
   * .line-highlight.line-highlight:before,
   * .line-highlight.line-highlight[data-end]:after {}
   * ```
   */
  lineHighlightBeforeAfter?: T
  /** the background color for a highlighted line */
  lineHighlightBackgroundBeforeAfter?: T
}

export type HSL = `hsl(${number}${string}, ${number}${string}, ${number}${string})`
export type HSLA = `hsla(${number}${string}, ${number}${string}, ${number}${string}, ${number}${string})`
export type RGB = `rgb(${number}${string}, ${number}${string}, ${number}${string})`
export type RGBA = `hsla(${number}${string}, ${number}${string}, ${number}${string}, ${number}${string})`
export type HEX = `#${string}`
export type Opacity = `/${number}` | ''

export type Color = `${HSL | HSLA | RGB | RGBA | HEX | ''}${Opacity}`
