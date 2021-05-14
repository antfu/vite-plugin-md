import type { Plugin } from 'vite'
import { Options } from './types'
import { createMarkdown } from './markdown'
import { resolveOptions } from './options'

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options = resolveOptions(userOptions)
  const markdownToVue = createMarkdown(options)

  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    transform(raw, id) {
      if (id.endsWith('.md')) {
        try {
          return markdownToVue(id, raw)
        }
        catch (e) {
          this.error(e)
          return ''
        }
      }
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.md')) {
        const defaultRead = ctx.read
        ctx.read = async function() {
          return markdownToVue(ctx.file, await defaultRead())
        }
      }
    },
  }
}

export default VitePluginMarkdown
