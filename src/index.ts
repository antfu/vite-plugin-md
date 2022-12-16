import type { InlineConfig, Plugin, UserConfig } from 'vite'
import type { TransformResult } from 'rollup'
import { createSfcComponent } from './createSfcComponent'
import { resolveOptions } from './options'
import type { Options } from './types'
import { createFilter } from './utils/createFilter'
export { composeSfcBlocks } from './composeSfcBlocks'
export * from './types'

export type ViteConfig = Readonly<Omit<UserConfig, 'plugins' | 'assetsInclude' | 'optimizeDeps' | 'worker'> & {
  configFile: string | undefined
  configFileDependencies: string[]
  inlineConfig: InlineConfig
  experimental: any
}>

function VitePluginMarkdown<O extends Options<any>>(userOptions: O = {} as O) {
  const options = resolveOptions(userOptions)
  const markdownToVue = createSfcComponent(options)
  let config: ViteConfig

  /** filter out files which aren't Markdown files */
  const filter = createFilter(
    userOptions.include || /\.md$/,
    userOptions.exclude || null,
  )

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
