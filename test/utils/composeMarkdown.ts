import { composeSfcBlocks } from '../../src/pipeline'
import type { Options } from '../../src/types'

export const composeMarkdown = async (markdown: string, options: Options = {}) => {
  return composeSfcBlocks(
    'test-with-raw-markdown',
    markdown,
    options,
  )
}
