import type { IThemeRegistration, Lang, Highlighter as ShikiHighlighter } from 'shiki'
import type { IDarkModeThemeRegistration, LineClassFn, ShikiOptions } from '../types/code-types'

function validateLanguage(lang: string): Lang | undefined {
  return ['abap', 'actionscript-3', 'ada', 'apache', 'apex', 'apl', 'applescript', 'asm', 'astro', 'awk', 'ballerina', 'bat', 'batch', 'berry', 'be', 'bibtex', 'bicep', 'c', 'clojure', 'clj', 'cobol', 'codeql', 'ql', 'coffee', 'cpp', 'crystal', 'csharp', 'c#', 'css', 'cue', 'd', 'dart', 'diff', 'docker', 'dream-maker', 'elixir', 'elm', 'erb', 'erlang', 'fish', 'fsharp', 'f#', 'gherkin', 'git-commit', 'git-rebase', 'gnuplot', 'go', 'graphql', 'groovy', 'hack', 'haml', 'handlebars', 'hbs', 'haskell', 'hcl', 'hlsl', 'html', 'ini', 'java', 'javascript', 'js', 'jinja-html', 'json', 'jsonc', 'jsonnet', 'jssm', 'fsl', 'jsx', 'julia', 'jupyter', 'kotlin', 'latex', 'less', 'lisp', 'logo', 'lua', 'make', 'makefile', 'markdown', 'md', 'marko', 'matlab', 'mdx', 'nginx', 'nim', 'nix', 'objective-c', 'objc', 'objective-cpp', 'ocaml', 'pascal', 'perl', 'php', 'plsql', 'postcss', 'powershell', 'ps', 'ps1', 'prisma', 'prolog', 'pug', 'jade', 'puppet', 'purescript', 'python', 'py', 'r', 'raku', 'perl6', 'razor', 'rel', 'riscv', 'ruby', 'rb', 'rust', 'rs', 'sas', 'sass', 'scala', 'scheme', 'scss', 'shaderlab', 'shader', 'shellscript', 'shell', 'bash', 'sh', 'zsh', 'smalltalk', 'solidity', 'sparql', 'sql', 'ssh-config', 'stata', 'stylus', 'styl', 'svelte', 'swift', 'system-verilog', 'tasl', 'tcl', 'tex', 'toml', 'tsx', 'turtle', 'twig', 'typescript', 'ts', 'vb', 'cmd', 'verilog', 'vhdl', 'viml', 'vim', 'vimscript', 'vue-html', 'vue', 'wasm', 'wenyan', '文言', 'xml', 'xsl', 'yaml', 'zenscript'].includes(lang) ? lang as Lang : undefined
}

function loadShiki(): ShikiHighlighter {
  return require('shiki')
}

function hasDarkMode(theme: ShikiOptions['theme']): theme is IDarkModeThemeRegistration {
  return !!(theme && typeof theme === 'object')
}

const grammerCache: Record<string, IThemeRegistration> = {}
function getGrammar(shiki: ShikiHighlighter, name: string) {
  if (grammerCache[name]) { return grammerCache[name] }
  else {
    grammerCache[name] = shiki.getTheme(name)
    return grammerCache[name]
  }
}

/**
 * A higher order function which offers partial application.
 *
 * - the first call loads the shiki library and theme(s)
 * - the second call asynchronously loads the language being requested
 * - this exposes a simple `highlight(code)` API
 */
export async function getShikiHighlighter(options: ShikiOptions) {
  const shiki = loadShiki()
  const { theme } = options
  const themes = hasDarkMode(theme)
    ? [theme.light, theme.dark] as [string, string]
    : [options.theme || 'nord'] as [string]
  // ensure themes availability
  themes.map(i => getGrammar(shiki, i))

  function wrap(line: string, klass: LineClassFn) {
    return `<span class="${klass(line)}">${line}</span>`
  }

  function highlight(lang: Lang, theme: string) {
    lang = validateLanguage(lang) || 'text' as Lang
    return (line: string, klass: LineClassFn) => wrap(
      shiki.codeToHtml(line, { lang, theme }),
      klass,
    )
  }

  return {
    highlight(code: string, lang: Lang, klass: LineClassFn): string {
      const modes = themes.map((t) => {
        return code
          .trimEnd()
          .split(/\r?\n/g)
          .map(line => highlight(lang, t)(line, klass))
          .join('\n')
      })

      return modes.length > 1
        ? `${wrap(modes[0], () => 'shiki shiki-light')}${wrap(modes[1], () => 'shiki shiki-dark')}`
        : modes[0]
    },
  }
}
