import type { Options } from './types'
import { composeSfcBlocks } from './pipeline/index'
import type { ViteConfig } from '.'

/**
 * Produces a _string_ which represents the parsed Markdown as a SFC component.
 */
export const createSfcComponent = <O extends Options<any>>(options: Partial<O> = {} as Partial<O>) => (config: ViteConfig) => {
  // callback called for each Markdown file
  return async (id: string, raw: string) => {
    const pipeline = await composeSfcBlocks(id, raw, options, config)
    return { code: pipeline.component, map: pipeline.map }
  }
}
