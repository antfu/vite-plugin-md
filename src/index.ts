import type { Plugin } from 'vite'
import MarkdownIt from 'markdown-it'
import { compileTemplate } from '@vue/compiler-sfc'
import { Options, ResolvedOptions } from './types'

function toArray<T>(n: T | T[]): T[] {
  if (!Array.isArray(n))
    return [n]
  return n
}

function VitePluginMarkdown(options: Options = {}): Plugin {
  const resolved: ResolvedOptions = Object.assign({
    markdownItOptions: {},
    markdownItUses: [],
    wrapperClasses: 'markdown-body',
  }, options)

  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...resolved.markdownItOptions,
  })

  resolved.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)

    markdown.use(plugin, options)
  })

  const wrapperClasses = toArray(resolved.wrapperClasses).filter(i => i).join(' ')

  return {
    transforms: [
      {
        test({ path }) {
          return path.endsWith('.md')
        },
        transform({ code, isBuild, path }) {
          const md = `<div class="${wrapperClasses}">${markdown.render(code, {})}</div>`

          let { code: result } = compileTemplate({
            filename: path,
            id: path,
            source: md,
            transformAssetUrls: false,
          })

          result = result.replace('export function render', 'function render')
          result += '\nconst __script = { render };'

          if (!isBuild)
            result += `\n__script.__hmrId = ${JSON.stringify(path)};`

          result += '\nexport default __script;'

          return result
        },
      },
    ],
  }
}

export default VitePluginMarkdown
