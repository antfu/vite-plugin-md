import type Token from 'markdown-it/lib/token'
import type { CodeBlockMeta, Modifier } from '../types'

function typedValue(value: string) {
  return value.startsWith('"')
    ? value.endsWith('"') ? value.slice(1, -1) : value.slice(1)
    : value === 'true'
      ? true
      : value === 'false'
        ? false
        : !Number.isNaN(value) ? Number(value) : value
}

/**
 * Converts the Markdown-IT _tokens_ into a `CodeBlockeMeta` data structure
 * which includes the language, modifiers, props, and code block.
 */
export function extractMarkdownItTokens(t: Token): CodeBlockMeta<'code'> {
  const matches = t.info.trim().match(/((!|#|\*){0,2})(\w+)\s+({.*}){0,1}(.*)$/)
  let props: Record<string, any> = {}
  let modifiers: Modifier[] = []
  let lang = t.info

  if (matches) {
    const [, m, , l, obj, csv] = matches
    if (obj) {
      try {
        props = JSON.parse(obj)
      }

      // see if this is a Vue/Vitepress line highlighting format or warn
      catch {
        const vpress = /\{\s*(([0-9]+)|([0-9]+-[0-9]+))\s*\}/m
        const [,, line, range] = Array.from(obj.match(vpress) || [])
        if (line) {
          props = { highlight: Number(line) }
        }
        else if (range) {
          const [left, right] = range.split(/\s*-\s*/)
          props = { highlight: [Number(left), Number(right)] }
        }
        else {
          props = {}
          console.warn(`- a fenced code block appeared to have a configuration object but failed to be parsed. When using an object notation always ensure it is valid JSON or alternatively you can use the CSV name/value style of assignment: ${obj}`)
        }
      }
    }
    else if (csv) {
      props = csv.split(',').reduce((acc, i) => {
        const [key, ...rest] = i.trim().split(/[:=]/)
        return { ...acc, [key.trim()]: typedValue(rest.join().trim()) }
      }, {})
    }

    if (m)
      modifiers = Array.from(m) as Modifier[]

    if (l)
      lang = l
  }

  return {
    pre: '',
    codeBlockWrapper: '',
    lineNumbersWrapper: '',

    code: t.content,
    level: t.level,
    tag: t.tag,
    lang,
    props,
    modifiers,
    markup: t.markup,
  } as CodeBlockMeta<'code'>
}
