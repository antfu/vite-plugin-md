import type { Plugin, ResolvedConfig } from 'vite'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import { compileTemplate } from '@vue/compiler-sfc'
import { Options, ResolvedOptions } from './types'

function toArray<T>(n: T | T[]): T[] {
  if (!Array.isArray(n))
    return [n]
  return n
}

export function parseId(id: string) {
  const index = id.indexOf('?')
  if (index < 0)
    return id

  else
    return id.slice(0, index)
}

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options: ResolvedOptions = Object.assign({
    headEnabled: false,
    headField: '',
    markdownItOptions: {},
    markdownItUses: [],
    markdownItSetup: () => {},
    wrapperClasses: 'markdown-body',
    wrapperComponent: null,
    transforms: {},
  }, userOptions)

  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...options.markdownItOptions,
  })

  options.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)

    markdown.use(plugin, options)
  })

  options.markdownItSetup(markdown)

  const wrapperClasses = toArray(options.wrapperClasses).filter(i => i).join(' ')
  let config: ResolvedConfig | undefined

  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    configResolved(_config) {
      config = _config
    },
    transform(raw, id) {
      const path = parseId(id)

      if (!path.endsWith('.md'))
        return raw

      if (options.transforms.before)
        raw = options.transforms.before(raw, id)

      const { content: md, data: frontmatter } = matter(raw)
      let sfc = markdown.render(md, {})
      if (options.wrapperClasses)
        sfc = `<div class="${wrapperClasses}">${sfc}</div>`
      if (options.wrapperComponent)
        sfc = `<${options.wrapperComponent} :frontmatter="frontmatter">${sfc}</${options.wrapperComponent}>`

      if (options.transforms.after)
        sfc = options.transforms.after(sfc, id)

      let { code: result } = compileTemplate({
        filename: path,
        id: path,
        source: sfc,
        transformAssetUrls: false,
      })

      result = result.replace('export function render', 'function render')
      result += `\nconst __matter = ${JSON.stringify(frontmatter)};`
      if (options.headEnabled) {
        const headGetter = options.headField === '' ? '__matter' : `__matter["${options.headField}"]`
        result = `import { useHead } from "@vueuse/head"\n${result}`
        result += `\nconst setup = () => { useHead(${headGetter} || {}); return { frontmatter: __matter }};`
      }
      else {
        result += '\nconst setup = () => ({ frontmatter: __matter });'
      }
      result += '\nconst __script = { render, setup };'

      if (!config?.isProduction)
        result += `\n__script.__hmrId = ${JSON.stringify(path)};`

      result += '\nexport default __script;'

      return result
    },
  }
}

export default VitePluginMarkdown
