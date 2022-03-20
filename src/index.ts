import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { createSfcComponent } from './createSfcComponent'
import { resolveOptions } from './options'
import type { Options } from './@types'
export { link, meta } from './builders'

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options = resolveOptions(userOptions)
  const markdownToVue = createSfcComponent(options)

  const filter = createFilter(
    userOptions.include || /\.md$/,
    userOptions.exclude,
  )

  let config: Parameters<Exclude<Plugin['configResolved'], undefined>>[0]

  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    configResolved(c) {
      config = { ...c }
    },
    transform(raw, id) {
      if (!filter(id))
        return
      try {
        return markdownToVue(config)(id, raw)
      }
      catch (e: any) {
        this.error(e)
      }
    },
    async handleHotUpdate(ctx) {
      if (!filter(ctx.file))
        return

      const defaultRead = ctx.read
      ctx.read = async function() {
        return markdownToVue(config)(ctx.file, await defaultRead())
      }
    },
  }
}

export default VitePluginMarkdown
