import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import type { TransformResult } from 'rollup'
import { createSfcComponent } from './createSfcComponent'
import { resolveOptions } from './options'
import type { Options } from './types'
export * from './builders'
export * from './types'
export { mergeColorThemes } from './builders/code/styles/color/mergeColorThemes'

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
    async transform(raw, id): Promise<TransformResult> {
      if (!filter(id))
        return

      try {
        /** converts Markdown to VueJS SFC string */
        const sfc = await markdownToVue(config)(id, raw)
        return {
          code: sfc,
        }
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
        return markdownToVue(config)(ctx.file, await defaultRead())
      }
    },
  } as Plugin
}

export default VitePluginMarkdown
