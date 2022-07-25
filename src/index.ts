import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { TransformResult } from 'rollup'
import { createSfcComponent } from './createSfcComponent'
import { resolveOptions } from './options'
import type { Options } from './types'
export { composeSfcBlocks } from './composeSfcBlocks'
export * from './types'

function VitePluginMarkdown(userOptions: Options = {}): Plugin {
  const options = resolveOptions(userOptions)
  const markdownToVue = createSfcComponent(options)

  /** filter out files which aren't Markdown files */
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
    async transform(content, file): Promise<TransformResult> {
      if (!filter(file))
        return

      try {
        /** converts Markdown to VueJS SFC string */
        return await markdownToVue(config)(file, content)
      }
      catch (e: any) {
        this.error(e)
      }
    },
    async handleHotUpdate(ctx) {
      if (!filter(ctx.file))
        return

      const defaultRead = ctx.read
      ctx.read = async function () {
        return (await markdownToVue(config)(ctx.file, await defaultRead())).code
      }
    },
  } as Plugin
}

export default VitePluginMarkdown
