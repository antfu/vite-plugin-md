/**
 * A dictionary of name value pairs used for looking up
 * language aliases.
 */
export const prismLanguageAliases = {
  ts: 'typescript',
  js: 'javascript',
  md: 'markdown',
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

export const prismLanguages = ['Markup', 'markup', 'CSS', 'css', 'C-like', 'clike', 'JavaScript', 'javascript', 'ABAP', 'abap', 'ActionScript', 'actionscript', 'Ada', 'ada', 'Apache Configuration', 'apacheconf', 'APL', 'apl', 'AppleScript', 'applescript', 'Arduino', 'arduino', 'ARFF', 'arff', 'AsciiDoc', 'asciidoc', '6502 Assembly', 'asm6502', 'ASP.NET (C#)', 'aspnet', 'AutoHotkey', 'autohotkey', 'AutoIt', 'autoit', 'Bash', 'bash', 'BASIC', 'basic', 'Batch', 'batch', 'Bison', 'bison', 'Brainfuck', 'brainfuck', 'Bro', 'bro', 'C', 'c', 'C#', 'csharp', 'C++', 'cpp', 'CoffeeScript', 'coffeescript', 'Clojure', 'clojure', 'Crystal', 'crystal', 'Content-Security-Policy', 'csp', 'CSS Extras', 'css-extras', 'D', 'd', 'Dart', 'dart', 'Diff', 'diff', 'Django/Jinja2', 'django', 'Docker', 'docker', 'Eiffel', 'eiffel', 'Elixir', 'elixir', 'Elm', 'elm', 'ERB', 'erb', 'Erlang', 'erlang', 'F#', 'fsharp', 'Flow', 'flow', 'Fortran', 'fortran', 'GEDCOM', 'gedcom', 'Gherkin', 'gherkin', 'Git', 'git', 'GLSL', 'glsl', 'GameMaker Language', 'gml', 'Go', 'go', 'GraphQL', 'graphql', 'Groovy', 'groovy', 'Haml', 'haml', 'Handlebars', 'handlebars', 'Haskell', 'haskell', 'Haxe', 'haxe', 'HTTP', 'http', 'HTTP Public-Key-Pins', 'hpkp', 'HTTP Strict-Transport-Security', 'hsts', 'IchigoJam', 'ichigojam', 'Icon', 'icon', 'Inform 7', 'inform7', 'Ini', 'ini', 'Io', 'io', 'J', 'j', 'Java', 'java', 'Jolie', 'jolie', 'JSON', 'json', 'Julia', 'julia', 'Keyman', 'keyman', 'Kotlin', 'kotlin', 'LaTeX', 'latex', 'Less', 'less', 'Liquid', 'liquid', 'Lisp', 'lisp', 'LiveScript', 'livescript', 'LOLCODE', 'lolcode', 'Lua', 'lua', 'Makefile', 'makefile', 'Markdown', 'markdown', 'Markup templating', 'markup-templating', 'MATLAB', 'matlab', 'MEL', 'mel', 'Mizar', 'mizar', 'Monkey', 'monkey', 'N4JS', 'n4js', 'NASM', 'nasm', 'nginx', 'nginx', 'Nim', 'nim', 'Nix', 'nix', 'NSIS', 'nsis', 'Objective-C', 'objectivec', 'OCaml', 'ocaml', 'OpenCL', 'opencl', 'Oz', 'oz', 'PARI/GP', 'parigp', 'Parser', 'parser', 'Pascal', 'pascal', 'Perl', 'perl', 'PHP', 'php', 'PHP Extras', 'php-extras', 'PL/SQL', 'plsql', 'PowerShell', 'powershell', 'Processing', 'processing', 'Prolog', 'prolog', 'properties', 'properties', 'Protocol Buffers', 'protobuf', 'Pug', 'pug', 'Puppet', 'puppet', 'Pure', 'pure', 'Python', 'python', 'Q (kdb+ database)', 'q', 'Qore', 'qore', 'R', 'r', 'React JSX', 'jsx', 'React TSX', 'tsx', 'Renpy', 'renpy', 'Reason', 'reason', 'reST (reStructuredText)', 'rest', 'Rip', 'rip', 'Roboconf', 'roboconf', 'Ruby', 'ruby', 'Rust', 'rust', 'SAS', 'sas', 'Sass (Sass)', 'sass', 'Sass (Scss)', 'scss', 'Scala', 'scala', 'Scheme', 'scheme', 'Smalltalk', 'smalltalk', 'Smarty', 'smarty', 'SQL', 'sql', 'Soy (Closure Template)', 'soy', 'Stylus', 'stylus', 'Swift', 'swift', 'TAP', 'tap', 'Tcl', 'tcl', 'Textile', 'textile', 'Template Toolkit 2', 'tt2', 'Twig', 'twig', 'TypeScript', 'typescript', 'VB.Net', 'vbnet', 'Velocity', 'velocity', 'Verilog', 'verilog', 'VHDL', 'vhdl', 'vim', 'vim', 'Visual Basic', 'visual-basic', 'WebAssembly', 'wasm', 'Wiki markup', 'wiki', 'Xeora', 'xeora', 'Xojo (REALbasic)', 'xojo', 'XQuery', 'xquery', 'YAML', 'yaml'] as const

type PL = keyof typeof prismLanguages
type PLA = keyof typeof prismLanguageAliases

export type PrismLanguage = PL | PLA

export const validPrismLanguage = (lang: string) => (prismLanguages as readonly string[]).includes(lang)
