import type { Options } from './types'
import { composeSfcBlocks } from './pipeline/index'
import type { ViteConfig } from '.'

/**
 * Produces a _string_ which represents the parsed Markdown as a SFC component.
 */
export const createSfcComponent = <B extends readonly any[] | []>(options: Partial<Options<B>> = {} as Partial<Options<B>>) => (config: ViteConfig) => {
  // callback called for each Markdown file
  return async (id: string, raw: string) => {
    const pipeline = await composeSfcBlocks(id, raw, options, config)
    return { code: pipeline.component, map: pipeline.map }
  }
}
