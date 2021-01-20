import type { Plugin, ResolvedConfig } from 'vite'
import { Options } from './types'
import { createMarkdown } from './markdown'
import { resolveOptions } from './options'

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options = resolveOptions(userOptions)
  const markdownToVue = createMarkdown(options)

  let vuePlugin: Plugin

  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    configResolved(config) {
      vuePlugin = config.plugins.find(p => p.name === 'vite:vue')!
      if (!vuePlugin)
        throw new Error('[vite-plugin-md] no vue plugin found, do you forget to install it?')
    },
    transform(raw, id) {
      if (id.endsWith('.md'))
        return markdownToVue(id, raw)
    },
    async handleHotUpdate(ctx) {
      // hot reload .md files as .vue files
      if (ctx.file.endsWith('.md')) {
        return vuePlugin.handleHotUpdate!({
          ...ctx,
          async read() {
            return markdownToVue(ctx.file, await ctx.read())
          },
        })
      }
    },
  }
}

export default VitePluginMarkdown
