import type { CodeColorTheme, Color, ColorByMode } from './color-types'
import { mergeColorThemes } from './mergeColorThemes'

export const baseLight: CodeColorTheme<Color> = {
  foreground: '#393a34',
  background: '#fbfbfb',

  comment: '#a0ada0',
  string: '#b56959',
  literal: '#2f8a89',
  keyword: '#296aa3',
  function: '#6c7834',
  deleted: '#1c6b48',
  class: '#2993a3',
  builtin: '#ab5959',
  property: '#b58451',
  namespace: '#b05a78',
  punctuation: '#8e8f8b',
  decorator: '#bd8f8f',
  regex: '#ab5e3f',
  jsonProperty: '#698c96',

  lineHighlightBackground: 'hsla(0, 0%, 33%, 0.25)',
}

export const dracula: CodeColorTheme<Color> = {
  foreground: '#f8f8f2',
  background: '#282a36',

  comment: '#6272a4',
  prolog: '#6272a4',
  doctype: '#6272a4',
  cdata: '#6272a4',

  punctuation: '#f8f8f2',
  namespace: '#f8f8f2/70',
  property: '#ff79c6',

  boolean: '#bd93f9',
  number: '#bd93f9',

  builtin: '#50fa7b',

  operator: '#f8f8f2',
  entity: '#f8f8f2',
  url: '#f8f8f2',
  string: '#f8f8f2',
  variable: '#f8f8f2',

  atrule: '#f1fa8c',
  function: '#f1fa8c',
  class: '#f1fa8c',
  attrValue: '#f1fa8c',

  keyword: '#8be9fd',

  regex: '#ffb86c',
  important: '#ffb86c',

  lineHighlightBackground: 'hsla(0, 0%, 33%, 0.25)',
}

export const darcula: CodeColorTheme<Color> = {
  foreground: '#a9b7c6',
  background: '#2b2b2b',

  comment: '#808080',
  keyword: '#cc7832',
  punctuation: '#a9b7c6',
  symbol: '#6897bb',
  property: '#9876aa',
  attrValue: '#a5c261',
  attrValueForPunctuation: '#a5c261',
  attrValueForPunctuationFirstChild: '#a9b7c6',
  url: '#287bde',
  function: '#ffc66d',
  regex: '#364135',
  inserted: '#294436',
  deleted: '#484a4a',
  class: '#ffc66d',
  builtin: '#e8bf6a',

  string: '#6a8759',

  namespace: '#b05a78',
  decorator: '#bd8f8f',

  lineHighlightBackground: 'hsla(0, 0%, 33%, 0.25)',
}

export const material: CodeColorTheme<ColorByMode> = {
  foreground: ['#263238', '#fd9170'],
  background: ['#cceae7', '#363636'],

  atrule: ['#7c4dff', '#c792ea'],
  attrName: ['#39adb5', '#ffcb6b'],
  attrValue: ['#f6a434', '#a5e844'],
  attribute: ['#f6a434', '#a5e844'],
  boolean: ['#7c4dff', '#c792ea'],

  builtin: ['#39adb5', '#ffcb6b'],
  class: ['#39adb5', '#ffcb6b'],
  className: ['#6182b8', '#f2ff00'],
  char: ['#39adb5', '#80cbc4'],
  cdata: ['#39adb5', '#80cbc4'],
  comment: ['#aabfc9', '#616161'],
  constant: ['#7c4dff', '#c792ea'],
  deleted: ['#e53935', '#ff6666'],
  doctype: ['#aabfc9', '#616161'],
  entity: ['#e53935', '#ff6666'],
  function: ['#7c4dff', '#c792ea'],
  hexcode: ['#f76d47', '#f2ff00'],
  id: ['#7c4dff', '#c792ea'],
  important: ['#7c4dff', '#c792ea'],
  inserted: ['#39adb5', '#80cbc4'],
  keyword: ['#7c4dff', '#c792ea'],
  number: ['#f76d47', '#fd9170'],
  operator: ['#39adb5', '#89ddff'],
  prolog: ['#aabfc9', '#616161'],
  property: ['#39adb5', '#80cbc4'],
  pseudoClass: ['#f6a434', '#a5e844'],
  pseudoElement: ['#f6a434', '#a5e844'],
  punctuation: ['#39adb5', '#89ddff'],
  regex: ['#6182b8', '#f2ff00'],
  selector: ['#e53935', '#ff6666'],
  string: ['#f6a434', '#a5e844'],
  symbol: ['#7c4dff', '#c792ea'],
  tag: ['#e53935', '#ff6666'],
  unit: ['#f76d47', '#fd9170'],
  url: ['#e53935', '#ff6666'],
  variable: ['#e53935', '#ff6666'],

  lineHighlightBackground: ['hsla(0, 0%, 33%, 0.25)', 'hsla(0, 0%, 33%, 0.25)'],
}

export const solarizedLight: CodeColorTheme<Color> = {
  foreground: '#657b83',
  background: '#fdf6e3',

  comment: '#93a1a1',
  punctuation: '#586e75',
  namespace: '/70',
  property: '#268bd2',
  tag: '#268bd2',
  boolean: '#268bd2',
  number: '#268bd2',
  constant: '#268bd2',
  symbol: '#268bd2',
  deleted: '#268bd2',

  selector: '#2aa198',
  attrName: '#2aa198',
  string: '#2aa198',
  char: '#2aa198',
  builtin: '#2aa198',
  url: '#2aa198',
  inserted: '#2aa198',

  entity: '#657b83', // bg: #eee8d5
  atrule: '#859900',
  attrValue: '#859900',
  keyword: '#859900',

  function: '#b58900',
  className: '#b58900',

  regex: '#cb4b16',
  important: '#cb4b16', // bold
  variable: '#cb4b16',

  lineHighlightBackground: 'hsla(0, 0%, 33%, 0.25)',
}

export const twilight: CodeColorTheme<Color> = {
  foreground: '#fdf6e3',
  background: 'hsl(200, 4%, 16%)',

  textSelectionBackground: 'hsla(0, 0%, 93%, 0.15)',

  comment: 'hsl(0, 0%, 47%)',
  prolog: 'hsl(0, 0%, 47%)',
  doctype: 'hsl(0, 0%, 47%)',
  cdata: 'hsl(0, 0%, 47%)',

  punctuation: '/70',
  namespace: '/70',

  tag: 'hsl(14, 58%, 55%)',
  boolean: 'hsl(14, 58%, 55%)',
  number: 'hsl(14, 58%, 55%)',
  deleted: 'hsl(14, 58%, 55%)',

  keyword: 'hsl(53, 89%, 79%)',
  property: 'hsl(53, 89%, 79%)',
  selector: 'hsl(53, 89%, 79%)',
  constant: 'hsl(53, 89%, 79%)',
  symbol: 'hsl(53, 89%, 79%)',
  builtin: 'hsl(53, 89%, 79%)',

  attrName: 'hsl(76, 21%, 52%)',
  attrValue: 'hsl(76, 21%, 52%)',
  string: 'hsl(76, 21%, 52%)',
  char: 'hsl(76, 21%, 52%)',
  operator: 'hsl(76, 21%, 52%)',
  entity: 'hsl(76, 21%, 52%)',
  url: 'hsl(76, 21%, 52%)',
  variable: 'hsl(76, 21%, 52%)',
  inserted: 'hsl(76, 21%, 52%)',

  atrule: 'hsl(218, 22%, 55%)',
  regex: 'hsl(42, 75%, 65%)',
  important: 'hsl(42, 75%, 65%)',

  markupTag: 'hsl(33, 33%, 52%)',
  markupAttrName: 'hsl(33, 33%, 52%)',
  markupPunctuation: 'hsl(33, 33%, 52%)',

  lineHighlightBackground: 'hsla(0, 0%, 33%, 0.25)', // add linear gradient and border

  lineHighlightBeforeAfter: 'hsl(215, 15%, 59%)',
  lineHighlightBackgroundBeforeAfter: 'hsl(24, 20%, 95%)',
}

export const tomorrow: CodeColorTheme<Color> = {
  foreground: '#ccc',
  background: '#2d2d2d',

  comment: '#999',
  blockComment: '#999',
  doctype: '#999',
  prolog: '#999',
  cdata: '#999',

  punctuation: '#ccc',

  tag: '#e2777a',
  attrName: '#e2777a',
  namespace: '#e2777a',
  deleted: '#e2777a',

  functionName: '#6196cc',
  boolean: '#f08d49',
  number: '#f08d49',
  function: '#f08d49',

  property: '#f8c555',
  className: '#f8c555',
  constant: '#f8c555',
  symbol: '#f8c555',

  selector: '#cc99cd',
  important: '#cc99cd',
  atrule: '#cc99cd',
  keyword: '#cc99cd',
  builtin: '#cc99cd',

  string: '#7ec699',
  char: '#7ec699',
  attrValue: '#7ec699',
  regex: '#7ec699',
  variable: '#7ec699',

  operator: '#67cdcc',
  entity: '#67cdcc',
  url: '#67cdcc',

  inserted: '#157A44',
}

export const themes: Record<string, CodeColorTheme<ColorByMode>> = {
  base: mergeColorThemes(baseLight, darcula),
  dracula: mergeColorThemes(darcula, dracula),
  lighting: mergeColorThemes(twilight, solarizedLight),
  material,
}
