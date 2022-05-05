/**
 * A dictionary of name value pairs used for looking up
 * language aliases.
 */
export const prismLanguageAliases = {
  ts: 'typescript',
  js: 'javascript',
  md: 'markdown',
  sh: 'bash',
  zsh: 'bash',
  vue: 'handlebars',
  html: 'handlebars',
  ascii: 'asciidoc',
} as const

/**
 * Will translate any known language aliases to the formal name
 * but otherwise will keep the name as is
 */
export const prismTranslateAliases = (candidate: string) => {
  return candidate in prismLanguageAliases
    ? prismLanguageAliases[candidate as PLA] as string
    : candidate
}

export const prismLanguages = ['html', 'markup', 'css', 'C-like', 'javascript', 'abap', 'actionscript', 'ada', 'apacheconf', 'apl', 'applescript', 'arduino', 'arff', 'asciidoc', 'asm6502', 'aspnet', 'autohotkey', 'autoit', 'bash', 'basic', 'batch', 'bison', 'brainfuck', 'bro', 'c', 'C#', 'C++', 'coffeescript', 'clojure', 'crystal', 'csp', 'css-extras', 'd', 'dart', 'diff', 'django', 'docker', 'eiffel', 'elixir', 'elm', 'erb', 'erlang', 'F#', 'flow', 'fortran', 'gedcom', 'gherkin', 'git', 'glsl', 'gml', 'go', 'graphql', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'http', 'hpkp', 'hsts', 'ichigojam', 'icon', 'inform7', 'ini', 'io', 'j', 'java', 'jolie', 'json', 'julia', 'keyman', 'kotlin', 'LaTeX', 'less', 'liquid', 'lisp', 'livescript', 'lolcode', 'lua', 'makefile', 'markdown', 'markup-templating', 'matlab', 'mel', 'mizar', 'monkey', 'n4js', 'nasm', 'nginx', 'nim', 'nix', 'nsis', 'Objective-C', 'ocaml', 'opencl', 'oz', 'parigp', 'parser', 'pascal', 'perl', 'php', 'php-extras', 'PL/SQL', 'powershell', 'processing', 'prolog', 'properties', 'protobuf', 'pug', 'puppet', 'pure', 'python', 'q', 'qore', 'r', 'jsx', 'tsx', 'renpy', 'reason', 'rest', 'rip', 'roboconf', 'ruby', 'rust', 'sas', 'sass', 'scss', 'scala', 'scheme', 'smalltalk', 'smarty', 'sql', 'soy', 'stylus', 'swift', 'tap', 'tcl', 'textile', 'tt2', 'Twig', 'twig', 'typescript', 'VB.Net', 'velocity', 'verilog', 'vhdl', 'vim', 'visual-basic', 'wasm', 'wiki', 'xeora', 'xojo', 'xquery', 'yaml'] as const

type PL = keyof typeof prismLanguages
type PLA = keyof typeof prismLanguageAliases

export type PrismLanguage = PL | PLA

export const validPrismLanguage = (lang: string) => (prismLanguages as readonly string[]).includes(lang)
