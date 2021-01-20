import type { Plugin, ResolvedConfig } from 'vite'
import MarkdownIt from 'markdown-it'
import { Options, ResolvedOptions } from './types'
import { markdownToVue } from './markdownToVue'
import { toArray } from './utils'
import { resolveOptions } from './options'

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options = resolveOptions(userOptions)
  let viteConfig: ResolvedConfig
  let vuePlugin: Plugin

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

  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    transform(raw, id) {
      if (!id.endsWith('.md'))
        return null

      return markdownToVue(options, raw, id, markdown)
    },
    configResolved(config) {
      viteConfig = config
      vuePlugin = config.plugins.find(p => p.name === 'vite:vue')!
      if (!vuePlugin)
        throw new Error('[vite-plugin-md] no vue plugin found, do you forget to install it?')
    },
    async handleHotUpdate(ctx) {
      // hot reload .md files as .vue files
      if (ctx.file.endsWith('.md')) {
        return vuePlugin.handleHotUpdate!({
          ...ctx,
          read: async() => {
            return markdownToVue(options, await ctx.read(), ctx.file, markdown)
          },
        })
      }
    },
  }
}

export default VitePluginMarkdown
