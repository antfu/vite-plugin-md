import { pipe } from 'fp-ts/lib/function'
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type { Pipeline, PipelineStage } from '../../../types'
import type {
  CodeFenceMeta,
  CodeOptions,
  HighlighterFunction,
  LineClassFn,
  Modifier,
} from '../types'
import {
  isLineCallback,
  isValidLanguage,
  usesPrismHighlighting,
} from '../utils'
import { establishHighlighter } from './establishHighlighter'

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
 * Converts the Markdown-IT `Token` into a `CodeFenceMeta` data structure
 */
function extractInfo(t: Token): CodeFenceMeta {
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
      catch {
        props = {}
        console.warn(`- a fenced code block appeared to have a configuration object but failed to be parsed. When using an object notation always ensure it is valid JSON or alternatively you can use the CSV name/value style of assignment: ${obj}`)
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
    data: t.content,
    tag: t.tag,
    lang,
    props,
    modifiers,
    markup: t.markup,
  }
}

/**
 * Looks for invalid and non-existant language settings and uses fallbacks
 * where available
 */
const resolveLanguage = (o: CodeOptions) => (fence: CodeFenceMeta) => {
  if (fence.lang) {
    if (isValidLanguage(o.engine, fence)) {
      fence.lang = usesPrismHighlighting(o)
        ? o.defaultLanguageForUnknown || o.defaultLanguage || ''
        : fence.lang
    }
  }

  if (!fence.lang) {
    fence.lang = usesPrismHighlighting(o)
      ? o.defaultLanguageForUnspecified || o.defaultLanguage
      : fence.lang
  }

  return fence
}

/**
 * If configured to highlight lines (default is `true`) and line
 * annotation is found in code block then it will be
 */
const highlightLines = (_o: CodeOptions) => (fence: CodeFenceMeta) => {
  return fence
}

/**
 * If configured for line numbers, the appropriate HTML will be added
 * to bring this in.
 */
const showLineNumbers = (o: CodeOptions) => (fence: CodeFenceMeta) => {
  return o.lineNumbers
    ? {
      ...fence,
      props: {
        ...fence.props,
        class: [...(fence.props?.class || '').split(/\s+/), 'line-numbers-mode'].join(' '),
      },
    }
    : fence
}

const userRules = (when: 'before' | 'after', p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeFenceMeta): CodeFenceMeta => {
  return o[when] ? o[when](fence, p, o) : fence
}

const klass = (o: CodeOptions, fence: CodeFenceMeta): LineClassFn => {
  const { lineClass } = o
  const { data, lang } = fence
  return lineClass
    ? isLineCallback(lineClass)
      ? (line: string) => ['line', lineClass(line, data, lang)].join(' ')
      : typeof lineClass === 'string'
        ? (_: string) => lineClass
        : (_: string) => ''
    : (_: string) => 'line'
}

/**
 * Use Prism or Shiki to modify the code block into stylized HTML
 */
const useHighlighter = (h: HighlighterFunction, o: CodeOptions) => (fence: CodeFenceMeta): CodeFenceMeta => {
  return {
    ...fence,
    data: h(fence.data, fence.lang, klass(o, fence)),
  }
}

/**
 * Renders the HTML which results from the code block transform pipeline
 */
const renderFence = (fence: CodeFenceMeta): string => {
  return `<pre class='${[`language-${fence.lang}`, fence.props.class?.trim()].filter(i => i).join(' ')}'${fence.props.style ? ` style='${fence.props.style}'` : ''}><code>
${fence.data.trim()}
</code></pre>`
}

/**
 * A higher-order function which receives payload and options for context up front
 * and then can be added as Markdown plugin using the standard `.use()` method.
 */
export const fence = async(payload: Pipeline<PipelineStage.parser>, options: CodeOptions) => {
  const highlighter = await establishHighlighter(options)

  // return a Markdown-IT plugin
  return (
    md: MarkdownIt,
  ) => {
    md.renderer.rules.fence = (state, idx) => {
      // fence mutation pipeline
      const fence = pipe(
        extractInfo(state[idx]),

        userRules('before', payload, options),

        resolveLanguage(options),
        useHighlighter(highlighter, options),
        highlightLines(options),
        showLineNumbers(options),

        userRules('after', payload, options),
      )

      return renderFence(fence)
    }
  }
}
