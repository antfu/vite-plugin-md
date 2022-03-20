import type { Options, ViteConfig } from './@types'
import { composeSfcBlocks } from './pipeline/index'

/**
 * Produces a _string_ which represents the parsed Markdown as a SFC component.
 */
export const createSfcComponent = (options: Options = {}) => (config: ViteConfig) => {
  // callback called for each Markdown file
  return (id: string, raw: string) => {
    return composeSfcBlocks(id, raw, options, config).component
  }
}
