import type { CodeColorTheme, Color, ColorByMode } from './color-types'
import { mergeColorThemes } from './mergeColorThemes'

export const base: CodeColorTheme<ColorByMode> = {
  foreground: ['#393a34', '#d4cfbf'],
  background: ['#fbfbfb', '#1e1e1e'],

  lineNumber: ['#636363', '#888888'],
  lineNumberGutter: ['#BEBEBE', '#eeeeee'],
  highlight: ['#C0C0C0', '#444444'],
  textSelection: ['#656565', '#787878'],

  comment: ['#a0ada0', '#758575'],
  string: ['#b56959', '#d48372'],
  literal: ['#2f8a89', '#429988'],
  keyword: ['#296aa3', '#3385CC'],
  operator: ['#296aa3', '#3385CC'],
  boolean: ['#00B370', '#1c6b48'],
  number: ['#0086D3', '#6394bf'],
  variable: ['#B09B41', '#c2b36e'],
  function: ['#6c7834', '#a1b567'],
  deleted: ['#963E47', '#a14f55'],
  class: ['#2993a3', '#54b1bf'],
  builtin: ['#D88D41', '#e0a569'],
  property: ['#b58451', '#dd8e6e'],
  namespace: ['#b05a78', '#db889a'],
  punctuation: ['#8e8f8b', '#858585'],
  decorator: ['#AA7070', '#bd8f8f'],
  regex: ['#894B32', '#ab5e3f'],
  jsonProperty: ['#587586', '#6b8b9e'],

}

export const dracula: CodeColorTheme<Color> = {
  foreground: '#f8f8f2',
  background: '#282a36',

  lineNumber: '#888888',
  lineNumberGutter: '#eeeeee',
  highlight: '#444444',
  textSelection: '#787878',

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
}

export const darcula: CodeColorTheme<Color> = {
  foreground: '#a9b7c6',
  background: '#2b2b2b',

  lineNumber: '#636363',
  lineNumberGutter: '#BEBEBE',
  highlight: '#363636',
  textSelection: '#656565',

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
}

export const duotone: CodeColorTheme<ColorByMode> = {
  foreground: ['#728fcb', '#9a86fd'],
  background: ['#faf8f5', '#6a51e6'],

  lineNumber: ['#9DB1DB', '#B7A9FE'],
  lineNumberGutter: ['#ece8de', '#B7A9FE'],
  highlight: ['#E8DFD1', '#391DC7'],
  textSelection: ['', ''],

  atrule: ['#728fcb', '#ffcc99'],
  attrName: ['#896724', '#c4b9fe'],
  attrValue: ['#728fcb', '#ffcc99'],
  attribute: ['#b29762', '#ffcc99'],
  boolean: ['#728fcb', '#ffcc99'],

  builtin: ['#b29762', '#9a86fd'],
  class: ['#b29762', '#9a86fd'],
  className: ['#b29762', '#9a86fd'],
  char: ['#728fcb', '#ffcc99'],
  cdata: ['#b6ad9a', '#A6A3B7'],
  comment: ['#b6ad9a', '#A6A3B7'],
  constant: ['#063289', '#e09142'],
  deleted: ['#FF9A6C', '#FFB999'],
  doctype: ['#b6ad9a', '#A6A3B7'],
  entity: ['#728fcb', '#ffcc99'],
  function: ['#b29762', '#9a86fd'],
  hexcode: ['#728fcb', '#ffcc99'],
  id: ['#2d2006', '#eeebff'],
  important: ['#896724', '#FFB999'],
  inserted: ['', '#D9FF99'],
  keyword: ['#728fcb', '#ffcc99'],
  number: ['#063289', '#e09142'],
  operator: ['#063289', '#e09142'],
  prolog: ['#b6ad9a', '#A6A3B7'],
  property: ['#b29762', '#9a86fd'],
  placeholder: ['#93abdc', '#ffcc99'],
  punctuation: ['#b6ad9a', '#A6A3B7'],
  regex: ['#728fcb', '#ffcc99'],
  selector: ['#2d2006', '#eeebff'],
  string: ['#728fcb', '#ffcc99'],
  symbol: ['#728fcb', '#ffcc99'],
  tag: ['#063289', '#e09142'],
  unit: ['#728fcb', '#ffcc99'],
  url: ['#728fcb', '#ffcc99'],
  variable: ['#93abdc', '#ffcc99'],
}

export const material: CodeColorTheme<ColorByMode> = {
  foreground: ['#B84903', '#fd9170'],
  background: ['#E4D1CF', '#363636'],

  lineNumber: ['#636363', '#888888'],
  lineNumberGutter: ['#BEBEBE', '#eeeeee'],
  highlight: ['#ACACAC', '#444444'],
  textSelection: ['#656565', '#787878'],

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
  comment: ['#7597A7', '#616161'],
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

}

export const solarizedLight: CodeColorTheme<ColorByMode> = {
  foreground: ['#7C929B', '#657b83;'],
  background: ['#E3EEF1', '#073642'],

  lineNumber: ['#636363', '#888888'],
  lineNumberGutter: ['#BEBEBE', '#eeeeee'],
  highlight: ['#363636', 'hsla(194, 48%, 26%, 0.75)'],
  textSelection: ['#656565', '#787878'],

  comment: ['#93a1a1', '#B3BDBD'],
  punctuation: ['#586e75', '#586e75'],
  property: ['#268bd2', '#4FA4DF'],
  operator: ['#268bd2', '#4FA4DF'],
  tag: ['#268bd2', '#4FA4DF'],
  boolean: ['#268bd2', '#4FA4DF'],
  number: ['#268bd2', '#4FA4DF'],
  constant: ['#268bd2', '#4FA4DF'],
  symbol: ['#268bd2', '#4FA4DF'],
  deleted: ['#268bd2', '#4FA4DF'],

  selector: ['#2aa198', '#33C3B8'],
  attrName: ['#2aa198', '#33C3B8'],
  string: ['#2aa198', '#33C3B8'],
  char: ['#2aa198', '#33C3B8'],
  builtin: ['#2aa198', '#33C3B8'],
  url: ['#2aa198', '#33C3B8'],
  inserted: ['#2aa198', '#33C3B8'],

  entity: ['#657b83', '#7D939B'], // bg: #eee8d5
  atrule: ['#859900', '#9BB300'],
  attrValue: ['#859900', '#9BB300'],
  keyword: ['#859900', '#9BB300'],

  function: ['#b58900', '#D9A400'],
  className: ['#b58900', '#D9A400'],

  regex: ['#cb4b16', '#E96934'],
  important: ['#cb4b16', '#E96934'], // bold
  variable: ['#cb4b16', '#E96934'],

}

export const twilight: CodeColorTheme<ColorByMode> = {
  foreground: ['#263238', '#fd9170'],
  background: ['#cceae7', '#363636'],

  lineNumber: ['#636363', '#888888'],
  lineNumberGutter: ['#BEBEBE', '#eeeeee'],
  highlight: ['#474747', '#444444'],
  textSelection: ['#656565', '#787878'],

  comment: ['hsl(0, 0%, 50%)', 'hsl(0, 0%, 65%)'],
  prolog: ['hsl(0, 0%, 50%)', 'hsl(0, 0%, 65%)'],
  doctype: ['hsl(0, 0%, 50%)', 'hsl(0, 0%, 65%)'],
  cdata: ['hsl(0, 0%, 50%)', 'hsl(0, 0%, 65%)'],
  punctuation: ['hsl(8, 8%, 55%)', 'hsl(8, 8%, 68%)'],

  // punctuation: '/70',
  // namespace: '/70',

  tag: ['hsl(14, 58%, 55%)', 'hsl(14, 58%, 75%)'],
  boolean: ['hsl(14, 58%, 55%)', 'hsl(14, 58%, 75%)'],
  number: ['hsl(14, 58%, 55%)', 'hsl(14, 58%, 75%)'],
  deleted: ['hsl(6, 58%, 55%)', 'hsl(6, 58%, 75%)'],

  keyword: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],
  property: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],
  selector: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],
  constant: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],
  symbol: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],
  builtin: ['hsl(53, 89%, 79%)', 'hsl(53, 89%, 85%)'],

  attrName: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  attrValue: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  string: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  char: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  operator: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  entity: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  url: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  variable: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],
  inserted: ['hsl(76, 21%, 52%)', 'hsl(76, 21%, 64%)'],

  atrule: ['hsl(218, 50%, 55%)', 'hsl(218, 50%, 68%)'],
  regex: ['hsl(42, 75%, 65%)', 'hsl(42, 75%, 75%)'],
  important: ['hsl(42, 75%, 65%)', 'hsl(42, 75%, 75%)'],
  markupTag: ['hsl(33, 33%, 52%)', 'hsl(33, 33%, 72%)'],
  markupAttrName: ['hsl(33, 33%, 52%)', 'hsl(33, 33%, 72%)'],
  markupPunctuation: ['hsl(33, 33%, 52%)', 'hsl(33, 33%, 72%)'],
}

export const tomorrow: CodeColorTheme<ColorByMode> = {
  foreground: ['#ccc', '#2d2d2d'],
  background: ['#2d2d2d', '#ccc'],

  lineNumber: ['#636363', '#888888'],
  lineNumberGutter: ['#BEBEBE', '#eeeeee'],
  highlight: ['#363636', '#5C5C5C'],
  textSelection: ['#656565', '#787878'],

  comment: ['#999', '#AEAEAE'],
  blockComment: ['#999', '#AEAEAE'],
  doctype: ['#999', '#AEAEAE'],
  prolog: ['#999', '#AEAEAE'],
  cdata: ['#999', '#AEAEAE'],
  punctuation: ['#ccc', '#727272'],
  tag: ['#e2777a', '#E89597'],
  attrName: ['#e2777a', '#E89597'],
  namespace: ['#e2777a', '#E89597'],
  deleted: ['#e2777a', '#E89597'],
  functionName: ['#6196cc', '#7AA7D4'],
  boolean: ['#f08d49', '#F29B60'],
  number: ['#f08d49', '#F29B60'],
  function: ['#f08d49', '#F29B60'],
  property: ['#f8c555', '#F9D179'],
  className: ['#f8c555', '#F9D179'],
  constant: ['#f8c555', '#F9D179'],
  symbol: ['#f8c555', '#F9D179'],
  selector: ['#cc99cd', '#BC7BBE'],
  important: ['#cc99cd', '#BC7BBE'],
  atrule: ['#cc99cd', '#BC7BBE'],
  keyword: ['#cc99cd', '#BC7BBE'],
  builtin: ['#cc99cd', '#BC7BBE'],
  string: ['#7ec699', '#47A169'],
  char: ['#7ec699', '#47A169'],
  attrValue: ['#7ec699', '#47A169'],
  regex: ['#7ec699', '#47A169'],
  variable: ['#7ec699', '#47A169'],
  operator: ['#67cdcc', '#2E8C8B'],
  entity: ['#67cdcc', '#2E8C8B'],
  url: ['#67cdcc', '#2E8C8B'],
  inserted: ['#157A44', '#199251'],
}

export const themes: Record<string, CodeColorTheme<ColorByMode>> = {
  base,
  dracula: mergeColorThemes(darcula, dracula),
  solarizedLight,
  twilight,
  tomorrow,
  material,
  duotone,
}
